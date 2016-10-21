# foobot
Telegram (more coming soon) bot for messing around

### TODO:
- [ ] Rename foobot to something more professional. foobot internally, but something like Mortimer externally (bot apis)
- [x] Canada Post package tracking
- [ ] FedEx package tracking
- [ ] UPS package tracking
- [ ] Memory by foobot. Get foobot to member things for you
- [x] Facebook messenger support
- [ ] Facebook login for single user across all bot types
- [ ] Somewhere to hide secrets

### Notes:
Control flow:
```
Index => Routes => Processing => Source-specific Service => Actions => callback all the way to routes
```