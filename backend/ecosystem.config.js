module.exports = {
  apps: [
    {
      name: 'suprfly-api',
      cwd: '/home/suprfly/apps/suprfly/backend',
      script: './dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_file: '/home/suprfly/apps/suprfly/backend/.env',
      error_file: '/home/suprfly/logs/api-error.log',
      out_file: '/home/suprfly/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001,
      },
    },
  ],
};
