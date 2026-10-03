/**
 * TaxGuard - Enterprise Router
 * Enforces: Initial landing on #login, role-specific default dashboards, and clean view switches.
 */

const router = {
  routes: {},
  currentRoute: '',

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(hash) {
    window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
  },

  getParams(routePattern, hash) {
    const routeParts = routePattern.split('/');
    const hashParts = hash.replace(/^#/, '').split('/');

    if (routeParts.length !== hashParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].substring(1)] = decodeURIComponent(hashParts[i]);
      } else if (routeParts[i] !== hashParts[i]) {
        return null;
      }
    }
    return params;
  },

  handleRouteChange() {
    const rawHash = window.location.hash || '';
    const cleanHash = rawHash.replace(/^#\/?/, '');
    const user = api.getUser();

    // 1. If not logged in, ALWAYS force to #login
    if (!user) {
      if (cleanHash !== 'login') {
        window.location.hash = '#login';
        return;
      }
    }

    // 2. If logged in and on #login or empty, navigate to role-specific dashboard
    if (user && (cleanHash === 'login' || cleanHash === '')) {
      if (user.role === 'ADMIN') {
        window.location.hash = '#admin-dashboard';
        return;
      } else if (user.role === 'AUDITOR') {
        window.location.hash = '#audit-queue';
        return;
      } else {
        window.location.hash = '#dashboard';
        return;
      }
    }

    // 3. Match route handlers
    let matched = false;
    for (const pattern of Object.keys(this.routes)) {
      const params = this.getParams(pattern, cleanHash);
      if (params) {
        this.currentRoute = cleanHash;
        this.routes[pattern](params);
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (!user) {
        this.routes['login'] ? this.routes['login']() : null;
      } else {
        if (user.role === 'ADMIN') this.navigate('admin-dashboard');
        else if (user.role === 'AUDITOR') this.navigate('audit-queue');
        else this.navigate('dashboard');
      }
    }

    // 4. Update sidebar active state
    this.updateNavActiveState(cleanHash.split('/')[0]);
  },

  updateNavActiveState(baseRoute) {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const linkTarget = link.getAttribute('data-route');
      if (linkTarget === baseRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    this.handleRouteChange();
  }
};
