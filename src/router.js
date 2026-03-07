import store from './store/index';

class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const route = this.routes.find(r => r.path === hash) || this.routes.find(r => r.path === 'dashboard');

        if (route && this.currentRoute !== route) {
            this.currentRoute = route;
            store.setState({ activeTab: route.path });
        } else if (!route) {
            store.setState({ activeTab: hash }); // allow unknown routes to render a 404/coming soon
        }
    }

    navigate(path) {
        window.location.hash = path;
    }
}

export default Router;
