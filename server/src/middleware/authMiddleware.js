import jwt from "jsonwebtoken";

// Verifies the session token and attaches the authenticated user to the request.
// Verifica el token de sesión y adjunta el usuario autenticado a la petición.
export function authenticate(request, response, next) {
  const cookieName = process.env.COOKIE_NAME || "mentor_session";
  const token = request.cookies[cookieName];

  if (!token) {
    return response.status(401).json({
      success: false,
      message: "You must log in first."
    });
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return response.status(401).json({
      success: false,
      message: "Your session is invalid or has expired."
    });
  }
}

// Restricts access to routes based on the user's role.
// Restringe el acceso a rutas según el rol del usuario.
export function requireRole(...allowedRoles) {
  return function roleMiddleware(request, response, next) {
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        message: "You do not have permission to perform this action."
      });
    }

    next();
  };
}
