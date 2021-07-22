pm2 start gateway/server.js --name=Express-Gateway --restart-delay=3000
pm2 start services/GeneralService.js --name=General-Service --restart-delay=3000
pm2 start services/UserService.js --name=User-Service --restart-delay=3000
pm2 start services/ChatService.js --name=Chat-Service --restart-delay=3000