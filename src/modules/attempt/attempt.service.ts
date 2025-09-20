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
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAttemptDto: CreateAttemptDto, user?: JWTPayloadForUser) {
    // Validate that either user is authenticated or username is provided for guests
    if (!user && !createAttemptDto.username) {
      throw new BadRequestException('Username is required for guest users.');
    }

    // Validate ObjectId format for gameModeId
    if (!this.isValidObjectId(createAttemptDto.gameModeId)) {
      throw new BadRequestException('Invalid game mode ID format.');
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
      displayUsername = userRecord?.username || undefined;
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
      isPersonalBest = await this.checkPersonalBest(
        attempt.id,
        user.userId,
        createAttemptDto.gameModeId,
        createAttemptDto.language,
        createAttemptDto.wpm,
        createAttemptDto.accuracy,
      );
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
        user: attempt.user,
        language: attempt.language,
        gameMode: attempt.gameMode,
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
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
          throw new BadRequestException('Invalid dateFrom format');
        }
        where.createdAt.gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
          throw new BadRequestException('Invalid dateTo format');
        }
        where.createdAt.lte = toDate;
      }
    }

    try {
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

      if (attempts.length === 0) {
        return {
          attempts: [],
          pagination: {
            page,
            limit: take,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Get personal bests for this user and game modes
      const personalBests = await this.getUserPersonalBests(
        user.userId,
        attempts.map(a => ({ gameModeId: a.gameModeId, language: a.language }))
      );

      // Add personal best info to attempts
      const attemptsWithBests = attempts.map((attempt) => {
        const key = `${attempt.gameModeId}-${attempt.language}`;
        const userBests = personalBests.get(key);

        const isPersonalBest = userBests ? (
          userBests.bestWpmId === attempt.id || userBests.bestAccuracyId === attempt.id
        ) : false;

        return {
          ...attempt,
          createdAt: attempt.createdAt.toISOString(),
          isPersonalBest,
        };
      });

      return {
        attempts: attemptsWithBests,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new BadRequestException('Failed to retrieve attempts. Please check your query parameters.');
    }
  }

  async findOne(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid attempt ID format.');
    }

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
      isPersonalBest = await this.checkPersonalBest(
        attempt.id,
        attempt.userId,
        attempt.gameModeId,
        attempt.language,
        attempt.wpm,
        attempt.accuracy,
      );

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
      },
    };
  }

  async getStats(query: GetStatsDto, user: JWTPayloadForUser) {
    const { period = 'all', language } = query;

    // Calculate date filter based on period
    const dateFilter = this.buildDateFilter(period);

    // Build base filter
    const baseFilter: any = {
      userId: user.userId,
      ...dateFilter,
    };

    if (language) {
      baseFilter.language = language;
    }

    try {
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

      if (!attempts.length) {
        return {
          stats: {
            totalAttempts: 0,
            averageWpm: 0,
            bestWpm: 0,
            averageAccuracy: 0,
            bestAccuracy: 0,
            totalTimeTyped: 0,
            totalWordsTyped: 0,
            personalBests: { timeMode: {}, wordMode: {} },
            byLanguage: {},
            progressChart: [],
          },
        };
      }

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
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new BadRequestException('Failed to retrieve statistics. Please try again.');
    }
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

    // Validate inputs
    if (type === 'gameMode' && !gameModeId) {
      throw new BadRequestException('Game mode ID is required when type is "gameMode"');
    }
    if (type === 'language' && !language) {
      throw new BadRequestException('Language is required when type is "language"');
    }
    if (gameModeId && !this.isValidObjectId(gameModeId)) {
      throw new BadRequestException('Invalid game mode ID format');
    }

    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    // Build where conditions
    let where: any = {
      user: {
        username: { not: null }, // Only users with usernames
      },
    };

    // Apply type-specific filters
    if (type === 'gameMode' && gameModeId) {
      where.gameModeId = gameModeId;
    }

    if (type === 'language' && language) {
      where.language = language;
    }

    // Apply period filter
    const dateFilter = this.buildDateFilter(period);
    where = { ...where, ...dateFilter };

    try {
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

      if (!leaderboardData.length) {
        return {
          leaderboard: [],
          pagination: {
            page,
            limit: take,
            total: 0,
            totalPages: 0,
          },
          context: {
            type,
            gameMode: null,
            language,
            period,
            metric,
          },
        };
      }

      // Get user details and best attempts
      const userIds = leaderboardData.map(entry => entry.userId).filter(Boolean) as string[];

      const [users, bestAttempts] = await Promise.all([
        this.databaseService.user.findMany({
          where: {
            id: { in: userIds },
            username: { not: null },
          },
          select: { id: true, username: true },
        }),
        this.databaseService.attempt.findMany({
          where: {
            userId: { in: userIds },
            ...where,
          },
          select: {
            userId: true,
            wpm: true,
            accuracy: true,
            createdAt: true,
          },
        }),
      ]);

      // Create lookup maps
      const userMap = new Map(users.map(user => [user.id, user.username!]));
      const bestAttemptsMap = new Map<string, any>();

      // Find best attempt for each user
      bestAttempts.forEach(attempt => {
        const userId = attempt.userId!;
        const existing = bestAttemptsMap.get(userId);

        if (!existing || attempt[metric] > existing[metric]) {
          bestAttemptsMap.set(userId, attempt);
        }
      });

      // Build leaderboard entries
      const leaderboard = leaderboardData
        .map((entry, index) => {
          const userId = entry.userId!;
          const username = userMap.get(userId);
          const bestAttempt = bestAttemptsMap.get(userId);

          if (!username || !bestAttempt) {
            return null;
          }

          return {
            rank: skip + index + 1,
            username,
            value: entry._max[metric]!,
            attempts: entry._count,
            bestAttempt: {
              wpm: bestAttempt.wpm,
              accuracy: bestAttempt.accuracy,
              date: bestAttempt.createdAt.toISOString(),
            },
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      // Get total count for pagination
      const totalCount = await this.databaseService.attempt.groupBy({
        by: ['userId'],
        where,
        _count: true,
      });

      // Get context information
      let gameMode = null;
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
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      throw new BadRequestException('Failed to retrieve leaderboard. Please check your parameters.');
    }
  }

  async startSession(startSessionDto: StartSessionDto) {
    const { language, gameModeId, textId } = startSessionDto;

    // Validate ObjectId formats
    if (!this.isValidObjectId(gameModeId)) {
      throw new BadRequestException('Invalid game mode ID format.');
    }
    if (textId && !this.isValidObjectId(textId)) {
      throw new BadRequestException('Invalid text ID format.');
    }

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
        where: { id: textId, language }, // Also verify language matches
      });

      if (!text) {
        throw new NotFoundException(`Text with ID "${textId}" not found for language "${language}".`);
      }
    } else {
      // Get random text for the language
      const textsCount = await this.databaseService.text.count({
        where: { language },
      });

      if (textsCount === 0) {
        throw new NotFoundException(`No texts found for language "${language}".`);
      }

      // Get a random text
      const randomSkip = Math.floor(Math.random() * textsCount);
      text = await this.databaseService.text.findFirst({
        where: { language },
        skip: randomSkip,
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
  private async checkPersonalBest(
    attemptId: string,
    userId: string,
    gameModeId: string,
    language: Language,
    wpm: number,
    accuracy: number,
  ) {
    const [bestWpm, bestAccuracy] = await Promise.all([
      this.databaseService.attempt.findFirst({
        where: {
          userId,
          gameModeId,
          language,
        },
        orderBy: { wpm: 'desc' },
        select: { wpm: true, id: true },
      }),
      this.databaseService.attempt.findFirst({
        where: {
          userId,
          gameModeId,
          language,
        },
        orderBy: { accuracy: 'desc' },
        select: { accuracy: true, id: true },
      }),
    ]);

    return {
      wpm: !bestWpm || wpm > bestWpm.wpm || bestWpm.id === attemptId,
      accuracy: !bestAccuracy || accuracy > bestAccuracy.accuracy || bestAccuracy.id === attemptId,
    };
  }

  private async getUserPersonalBests(userId: string, gameModes: Array<{ gameModeId: string; language: Language }>) {
    const personalBests = new Map<string, any>();

    for (const { gameModeId, language } of gameModes) {
      const key = `${gameModeId}-${language}`;

      if (personalBests.has(key)) continue;

      const [bestWpm, bestAccuracy] = await Promise.all([
        this.databaseService.attempt.findFirst({
          where: { userId, gameModeId, language },
          orderBy: { wpm: 'desc' },
          select: { id: true, wpm: true },
        }),
        this.databaseService.attempt.findFirst({
          where: { userId, gameModeId, language },
          orderBy: { accuracy: 'desc' },
          select: { id: true, accuracy: true },
        }),
      ]);

      personalBests.set(key, {
        bestWpmId: bestWpm?.id,
        bestWpm: bestWpm?.wpm,
        bestAccuracyId: bestAccuracy?.id,
        bestAccuracy: bestAccuracy?.accuracy,
      });
    }

    return personalBests;
  }

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
      orderBy: [
        { gameModeId: 'asc' },
        { language: 'asc' },
        { wpm: 'desc' },
      ],
    });

    const personalBests = {
      timeMode: {} as Record<string, any>,
      wordMode: {} as Record<string, any>,
    };

    // Group by game mode and find bests
    const grouped = attempts.reduce((acc, attempt) => {
      const key = `${attempt.gameMode.type}_${attempt.gameMode.value}_${attempt.language}`;
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
        language: attempt.language,
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
    const dateFilter = this.buildDateFilter(period);

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

    if (!attempts.length) {
      return [];
    }

    // Group by date and calculate averages
    const dailyStats: Record<string, { wpm: number[]; accuracy: number[] }> = {};

    attempts.forEach((attempt) => {
      const date = attempt.createdAt.toISOString().split('T')[0];

      if (!dailyStats[date]) {
        dailyStats[date] = { wpm: [], accuracy: [] };
      }
      dailyStats[date].wpm.push(attempt.wpm);
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

  private buildDateFilter(period: string) {
    if (period === 'all') return {};

    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case '7d':
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
        break;
      case '30d':
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case '90d':
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days ago
        break;
      default:
        return {};
    }

    return { createdAt: { gte: startDate } };
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}