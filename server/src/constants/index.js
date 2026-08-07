// User Roles
const ROLES = {
  VISITOR: 'visitor',
  MEMBER: 'member',
  ADMIN: 'admin',
};

// Space Types
const SPACE_TYPES = {
  DESK: 'desk',
  MEETING_ROOM: 'meeting_room',
};

// Booking Statuses
const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Sort Options
const SORT_OPTIONS = {
  NEWEST: '-createdAt',
  OLDEST: 'createdAt',
  NAME_ASC: 'name',
  NAME_DESC: '-name',
  CAPACITY_ASC: 'capacity',
  CAPACITY_DESC: '-capacity',
};

module.exports = {
  ROLES,
  SPACE_TYPES,
  BOOKING_STATUS,
  HTTP_STATUS,
  PAGINATION,
  SORT_OPTIONS,
};
