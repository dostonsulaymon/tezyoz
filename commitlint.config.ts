module.exports = {
  plugins: [
    {
      rules: {
        ticketPattern: ({ header }) => {
          const pattern = /^\[(TICKET-\d+|VIP)\]\s+(feat|fix|docs|chore|refactor|ci|test|revert|perf|build):\s+(.*)$/;
          const matches = pattern.test(header);
          return [
            matches,
            'Commit message must match format:\n' +
              '    - [TICKET-123] type: message\n' +
              '    Valid types: feat, fix, docs, chore, refactor, ci, test, revert, perf, build',
          ];
        },
      },
    },
  ],
  rules: {
    'ticketPattern': [2, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};
