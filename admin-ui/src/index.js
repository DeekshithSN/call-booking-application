import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { MetricsProvider } from "@cabify/prom-react";

// please remember to define them outside the component to avoid unneeded re-renders
const customMetrics = [
  {
    type: 'counter',
    name: 'login_event',
    description: 'Number of times login event was triggered',
  },
  {
    type: 'counter',
    name: 'admin_visits',
    description: 'Number of visits to website',
  },
];

const normalizePath = (path) => {
  const match = path.match(/\/products\/(\d+)/);
  if (match) {
    return `/products/:id`;
  }
  return path;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MetricsProvider
    appName="adminUI"
    owner="admin"
    getNormalizedPath={normalizePath}
    metricsAggregatorUrl="https://webhook.site/f0d2b229-95f2-4f6f-bb77-7936306e6bc1" // To be replaced with prometheus gateway URL. This URL is only for local testing 
    customMetrics={customMetrics}
  >
    <App />
  </MetricsProvider>
);

reportWebVitals();
