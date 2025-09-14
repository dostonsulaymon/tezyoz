import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '#/modules/database/database.service';
import { CreateAttemptDto } from './dto/request/create-attempt.dto';
import { GetAttemptsDto } from './dto/request/get-attempts.dto';
import { GetStatsDto } from './dto/request/get-stats.dto';
import { GetLeaderboardDto } from './dto/request/get-leaderboard.dto';
import { StartSessionDto } from './dto/request/start-session.dto';
import { JWTPayloadForUser } from '#/modules/auth/types';
import { Language, GameModeType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttemptService {
  constructor(private readonly databaseService: DatabaseService) {
  }

  async create(createAttemptDto: CreateAttemptDto, user?: JWTPayloadForUser) {
    // Validate that either user is authenticated or username is provided for guests
    if (!user && !createAttemptDto.username) {
      throw new BadRequestException('Username is required for guest users.');
    }

    const gameMode = await this.databaseService.gameMode.findUnique({
      where: { id: createAttemptDto.gameModeId },
    });

    if (!gameMode) {
      throw new NotFoundException(`Game mode with ID "${createAttemptDto.gameModeId}" not found.`);
    }


    // Get username for display
    let displayUsername: string | undefined;
    if (user) {
      const userRecord = await this.databaseService.user.findUnique({
        where: { id: user.userId },
        select: { username: true },
      });
      // @ts-ignore
      displayUsername = userRecord?.username;
    } else {
      displayUsername = createAttemptDto.username;
    }

    // Create the attempt
    const attempt = await this.databaseService.attempt.create({
      data: {
        userId: user?.userId || null,
        language: createAttemptDto.language,
        gameModeId: createAttemptDto.gameModeId,
        wpm: createAttemptDto.wpm,
        accuracy: createAttemptDto.accuracy,
        errors: createAttemptDto.errors || 0,
        correctChars: createAttemptDto.correctChars,
        totalChars: createAttemptDto.totalChars,
        timeElapsed: createAttemptDto.timeElapsed,
      },
      include: {
        gameMode: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    // Check if this is a personal best (only for authenticated users)
    let isPersonalBest = { wpm: false, accuracy: false };
    if (user) {
      const [bestWpm, bestAccuracy] = await Promise.all([
        this.databaseService.attempt.findFirst({
          where: {
            userId: user.userId,
            gameModeId: createAttemptDto.gameModeId,
            language: createAttemptDto.language,
          },
          orderBy: { wpm: 'desc' },
          select: { wpm: true },
        }),
        this.databaseService.attempt.findFirst({
          where: {
            userId: user.userId,
            gameModeId: createAttemptDto.gameModeId,
            language: createAttemptDto.language,
          },
          orderBy: { accuracy: 'desc' },
          select: { accuracy: true },
        }),
      ]);

      isPersonalBest.wpm = !bestWpm || createAttemptDto.wpm > bestWpm.wpm;
      isPersonalBest.accuracy = !bestAccuracy || createAttemptDto.accuracy > bestAccuracy.accuracy;
    }

    // Get leaderboard positions (only if user has username)
    let leaderboardPosition;
    if (displayUsername) {
      leaderboardPosition = await this.getLeaderboardPosition(
        createAttemptDto.wpm,
        createAttemptDto.gameModeId,
        createAttemptDto.language,
      );
    }

    return {
      attempt: {
        id: attempt.id,
        userId: attempt.userId,
        username: displayUsername,
        user: attempt.userId,
        language: attempt.language,
        gameMode: attempt.gameModeId,
        wpm: attempt.wpm,
        accuracy: attempt.accuracy,
        errors: attempt.errors,
        correctChars: attempt.correctChars,
        totalChars: attempt.totalChars,
        timeElapsed: attempt.timeElapsed,
        createdAt: attempt.createdAt.toISOString(),
        isPersonalBest,
      },
      leaderboardPosition,
    };
  }

  async findAll(query: GetAttemptsDto, user: JWTPayloadForUser) {
    const {
      page = 1,
      limit = 20,
      language,
      gameModeType,
      gameModeValue,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    // Build where conditions
    const where: any = {
      userId: user.userId,
    };

    if (language) {
      where.language = language;
    }

    if (gameModeType || gameModeValue) {
      where.gameMode = {};
      if (gameModeType) where.gameMode.type = gameModeType;
      if (gameModeValue) where.gameMode.value = gameModeValue;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [attempts, total] = await Promise.all([
      this.databaseService.attempt.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gameMode: true,
        },
      }),
      this.databaseService.attempt.count({ where }),
    ]);

    // Check personal bests for each attempt
    const attemptsWithBests = await Promise.all(
      attempts.map(async (attempt) => {
        const [bestWpm, bestAccuracy] = await Promise.all([
          this.databaseService.attempt.findFirst({
            where: {
              userId: user.userId,
              gameModeId: attempt.gameModeId,
              language: attempt.language,
            },
            orderBy: { wpm: 'desc' },
            select: { wpm: true, id: true },
          }),
          this.databaseService.attempt.findFirst({
            where: {
              userId: user.userId,
              gameModeId: attempt.gameModeId,
              language: attempt.language,
            },
            orderBy: { accuracy: 'desc' },
            select: { accuracy: true, id: true },
          }),
        ]);

        return {
          ...attempt,
          createdAt: attempt.createdAt.toISOString(),
          isPersonalBest: bestWpm?.id === attempt.id || bestAccuracy?.id === attempt.id,
        };
      }),
    );

    return {
      attempts: attemptsWithBests,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const attempt = await this.databaseService.attempt.findUnique({
      where: { id },
      include: {
        gameMode: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID "${id}" not found.`);
    }

    // Check if this is a personal best (only for authenticated users)
    let isPersonalBest = { wpm: false, accuracy: false };
    let leaderboardPosition;

    if (attempt.userId) {
      const [bestWpm, bestAccuracy] = await Promise.all([
        this.databaseService.attempt.findFirst({
          where: {
            userId: attempt.userId,
            gameModeId: attempt.gameModeId,
            language: attempt.language,
          },
          orderBy: { wpm: 'desc' },
          select: { wpm: true, id: true },
        }),
        this.databaseService.attempt.findFirst({
          where: {
            userId: attempt.userId,
            gameModeId: attempt.gameModeId,
            language: attempt.language,
          },
          orderBy: { accuracy: 'desc' },
          select: { accuracy: true, id: true },
        }),
      ]);

      isPersonalBest.wpm = bestWpm?.id === attempt.id;
      isPersonalBest.accuracy = bestAccuracy?.id === attempt.id;

      // Get leaderboard positions
      if (attempt.user?.username) {
        leaderboardPosition = await this.getLeaderboardPosition(
          attempt.wpm,
          attempt.gameModeId,
          attempt.language,
        );
      }
    }

    return {
      attempt: {
        ...attempt,
        username: attempt.user?.username,
        createdAt: attempt.createdAt.toISOString(),
        isPersonalBest,
        leaderboardPosition,
        correctChars: attempt.correctChars,
        totalChars: attempt.totalChars,
        timeElapsed: attempt.timeElapsed,
      },
    };
  }

  async getStats(query: GetStatsDto, user: JWTPayloadForUser) {
    const { period = 'all', language } = query;

    // Calculate date filter based on period
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = { createdAt: { gte: startDate } };
    }

    // Build base filter
    const baseFilter: any = {
      userId: user.userId,
      ...dateFilter,
    };

    if (language) {
      baseFilter.language = language;
    }

    // Get basic stats
    const [attempts, totalStats] = await Promise.all([
      this.databaseService.attempt.findMany({
        where: baseFilter,
        include: { gameMode: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.databaseService.attempt.aggregate({
        where: baseFilter,
        _avg: {
          wpm: true,
          accuracy: true,
        },
        _max: {
          wpm: true,
          accuracy: true,
        },
        _count: true,
      }),
    ]);

    // Calculate total time and words typed
    let totalTimeTyped = 0;
    let totalWordsTyped = 0;

    for (const attempt of attempts) {
      if (attempt.gameMode.type === GameModeType.BY_TIME) {
        totalTimeTyped += attempt.gameMode.value;
        totalWordsTyped += Math.round((attempt.wpm * attempt.gameMode.value) / 60);
      } else {
        // For word mode, estimate time based on WPM
        const estimatedTime = (attempt.gameMode.value / attempt.wpm) * 60;
        totalTimeTyped += estimatedTime;
        totalWordsTyped += attempt.gameMode.value;
      }
    }

    // Get personal bests by game mode
    const personalBests = await this.getPersonalBests(user.userId, language);

    // Get stats by language
    const byLanguage = await this.getStatsByLanguage(user.userId, period);

    // Generate progress chart data (last 30 data points)
    const progressChart = await this.generateProgressChart(user.userId, language);

    return {
      stats: {
        totalAttempts: totalStats._count || 0,
        averageWpm: Number(totalStats._avg.wpm?.toFixed(2)) || 0,
        bestWpm: totalStats._max.wpm || 0,
        averageAccuracy: Number(totalStats._avg.accuracy?.toFixed(2)) || 0,
        bestAccuracy: totalStats._max.accuracy || 0,
        totalTimeTyped: Math.round(totalTimeTyped),
        totalWordsTyped: Math.round(totalWordsTyped),
        personalBests,
        byLanguage,
        progressChart,
      },
    };
  }

  async getLeaderboard(query: GetLeaderboardDto) {
    const {
      type = 'global',
      gameModeId,
      language,
      period = 'all',
      metric = 'wpm',
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    // Build where conditions (avoid relation filters in groupBy)
    let where: any = {
      userId: { not: null },
    };

    // Apply type-specific filters
    if (type === 'gameMode' && gameModeId) {
      where.gameModeId = gameModeId;
    }

    if (type === 'language' && language) {
      where.language = language;
    }

    // Apply period filter
    if (period !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'daily':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      where.createdAt = { gte: startDate };
    }

    // Get leaderboard data grouped by user
    const leaderboardData = await this.databaseService.attempt.groupBy({
      by: ['userId'],
      where,
      _max: {
        wpm: true,
        accuracy: true,
        createdAt: true,
      },
      _count: true,
      orderBy: {
        _max: {
          [metric]: 'desc',
        },
      },
      skip,
      take,
    });

    // Get user details for leaderboard entries
    const leaderboardPromises = leaderboardData.map(async (entry, index) => {
      const user = await this.databaseService.user.findUnique({
        where: { id: entry.userId! },
        select: { username: true },
      });

      // Skip users without username
      if (!user?.username) {
        return null;
      }

      // Build non-user filters for bestAttempt query
      const { userId: _ignoredUserId, ...nonUserFilters } = where;
      const bestAttempt = await this.databaseService.attempt.findFirst({
        where: {
          ...nonUserFilters,
          userId: entry.userId!,
          [metric]: entry._max[metric],
        },
        select: {
          wpm: true,
          accuracy: true,
          createdAt: true,
        },
      });

      return {
        rank: skip + index + 1,
        username: user.username,
        value: entry._max[metric]!,
        attempts: entry._count,
        bestAttempt: {
          wpm: bestAttempt!.wpm,
          accuracy: bestAttempt!.accuracy,
          date: bestAttempt!.createdAt.toISOString(),
        },
      };
    });

    const leaderboardResults = await Promise.all(leaderboardPromises);
    const leaderboard = leaderboardResults.filter(entry => entry !== null);

    // Get total count for pagination (we'll approximate since we filter by username later)
    const totalCount = await this.databaseService.attempt.groupBy({
      by: ['userId'],
      where,
      _count: true,
    });

    // Get context information
    let gameMode;
    if (type === 'gameMode' && gameModeId) {
      gameMode = await this.databaseService.gameMode.findUnique({
        where: { id: gameModeId },
      });
    }

    return {
      leaderboard,
      pagination: {
        page,
        limit: take,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / take),
      },
      context: {
        type,
        gameMode,
        language,
        period,
        metric,
      },
    };
  }

  async startSession(startSessionDto: StartSessionDto) {
    const { language, gameModeId, textId } = startSessionDto;

    // Validate game mode
    const gameMode = await this.databaseService.gameMode.findUnique({
      where: { id: gameModeId },
    });

    if (!gameMode) {
      throw new NotFoundException(`Game mode with ID "${gameModeId}" not found.`);
    }

    // Get text - either specific or random
    let text;
    if (textId) {
      text = await this.databaseService.text.findUnique({
        where: { id: textId },
      });

      if (!text) {
        throw new NotFoundException(`Text with ID "${textId}" not found.`);
      }
    } else {
      // Get random text for the language
      text = await this.databaseService.text.findFirst({
        where: { language },
        orderBy: { createdAt: 'desc' }, // For now, get latest. Could implement random selection
      });

      if (!text) {
        throw new NotFoundException(`No texts found for language "${language}".`);
      }
    }

    // Generate session ID
    const sessionId = `session_${uuidv4()}`;

    // Calculate session parameters
    const estimatedDuration = gameMode.type === GameModeType.BY_TIME ? gameMode.value : undefined;
    const targetWords = gameMode.type === GameModeType.BY_WORD ? gameMode.value : undefined;

    return {
      session: {
        sessionId,
        text: {
          id: text.id,
          content: text.content,
          language: text.language,
        },
        gameMode: {
          id: gameMode.id,
          type: gameMode.type,
          value: gameMode.value,
        },
        estimatedDuration,
        targetWords,
        startedAt: new Date().toISOString(),
      },
    };
  }

  // Helper methods
  private async getLeaderboardPosition(wpm: number, gameModeId: string, language: Language) {
    const [globalPos, gameModePos, languagePos] = await Promise.all([
      this.databaseService.attempt.count({
        where: {
          wpm: { gt: wpm },
          user: {
            username: { not: null },
          },
        },
      }),
      this.databaseService.attempt.count({
        where: {
          wpm: { gt: wpm },
          gameModeId,
          user: {
            username: { not: null },
          },
        },
      }),
      this.databaseService.attempt.count({
        where: {
          wpm: { gt: wpm },
          language,
          user: {
            username: { not: null },
          },
        },
      }),
    ]);

    return {
      global: globalPos + 1,
      gameMode: gameModePos + 1,
      language: languagePos + 1,
    };
  }

  private async getPersonalBests(userId: string, language?: Language) {
    const where: any = { userId };
    if (language) where.language = language;

    const attempts = await this.databaseService.attempt.findMany({
      where,
      include: { gameMode: true },
    });

    const personalBests = {
      timeMode: {} as Record<string, any>,
      wordMode: {} as Record<string, any>,
    };

    // Group by game mode and find bests
    const grouped = attempts.reduce((acc, attempt) => {
      const key = `${attempt.gameMode.type}_${attempt.gameMode.value}`;
      if (!acc[key] || attempt.wpm > acc[key].wpm) {
        acc[key] = attempt;
      }
      return acc;
    }, {} as Record<string, any>);

    // Format the results
    Object.values(grouped).forEach((attempt: any) => {
      const modeKey = attempt.gameMode.value.toString();
      const best = {
        wpm: attempt.wpm,
        accuracy: attempt.accuracy,
        date: attempt.createdAt.toISOString(),
      };

      if (attempt.gameMode.type === GameModeType.BY_TIME) {
        personalBests.timeMode[modeKey] = best;
      } else {
        personalBests.wordMode[modeKey] = best;
      }
    });

    return personalBests;
  }

  private async getStatsByLanguage(userId: string, period: string) {
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = { createdAt: { gte: startDate } };
    }

    const languageStats = await this.databaseService.attempt.groupBy({
      by: ['language'],
      where: {
        userId,
        ...dateFilter,
      },
      _avg: {
        wpm: true,
        accuracy: true,
      },
      _max: {
        wpm: true,
      },
      _count: true,
    });

    const result: any = {};
    languageStats.forEach((stat) => {
      result[stat.language] = {
        attempts: stat._count,
        averageWpm: Number(stat._avg.wpm?.toFixed(2)) || 0,
        bestWpm: stat._max.wpm || 0,
        averageAccuracy: Number(stat._avg.accuracy?.toFixed(2)) || 0,
      };
    });

    return result;
  }

  private async generateProgressChart(userId: string, language?: Language) {
    const where: any = { userId };
    if (language) where.language = language;

    // Get last 30 days of attempts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    where.createdAt = { gte: thirtyDaysAgo };

    const attempts = await this.databaseService.attempt.findMany({
      where,
      select: {
        wpm: true,
        accuracy: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date and calculate averages
    const dailyStats: Record<string, { wpm: number[]; accuracy: number[] }> = {};

    attempts.forEach((attempt) => {
      const date = attempt.createdAt.toISOString().split('T')[0];

      if (!dailyStats[date!]) {
        dailyStats[date!] = { wpm: [], accuracy: [] };
      }
      // @ts-ignore
      dailyStats[date].wpm.push(attempt.wpm);
      // @ts-ignore
      dailyStats[date].accuracy.push(attempt.accuracy);
    });

    // Convert to chart format
    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        averageWpm: Number(
          (stats.wpm.reduce((a, b) => a + b, 0) / stats.wpm.length).toFixed(2),
        ),
        averageAccuracy: Number(
          (stats.accuracy.reduce((a, b) => a + b, 0) / stats.accuracy.length).toFixed(2),
        ),
        attemptsCount: stats.wpm.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 data points
  }
}
