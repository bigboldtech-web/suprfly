module.exports = {
  apps: [
    {
      name: 'suprfly-dashboard',
      cwd: '/home/suprfly/apps/suprfly/dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      error_file: '/home/suprfly/logs/dashboard-error.log',
      out_file: '/home/suprfly/logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
