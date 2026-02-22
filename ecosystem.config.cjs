module.exports = {
  apps: [
    {
      name: 'print-toys',
      script: 'pnpm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: '3030'
      },
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false, // Don't watch in production - rebuild manually
      max_memory_restart: '512M',
      error_file: './logs/errors.log',
      out_file: './logs/output.log',
      log_file: './logs/combined.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
