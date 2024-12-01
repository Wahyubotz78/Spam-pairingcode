let totalVisitors = 0;
let totalRequests = 0;

function incrementVisitors() {
  totalVisitors += 1;
}

function incrementRequests() {
  totalRequests += 1;
}

function getVisitorCount() {
  return totalVisitors;
}

function getRequestCount() {
  return totalRequests;
}

module.exports = {
  incrementVisitors,
  incrementRequests,
  getVisitorCount,
  getRequestCount
};