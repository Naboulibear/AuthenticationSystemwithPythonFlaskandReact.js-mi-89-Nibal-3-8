const tokenFromSession = sessionStorage.getItem("token");
const userFromSession = JSON.parse(sessionStorage.getItem("user") || "null");
const hasSessionAuth = Boolean(tokenFromSession && userFromSession);
if (!hasSessionAuth) {
sessionStorage.removeItem("token");
sessionStorage.removeItem("user");
}

export const initialStore = {
token: hasSessionAuth ? tokenFromSession : null,
user: hasSessionAuth ? userFromSession : null,
isAuthenticated: hasSessionAuth
};

const storeReducer = (store, action) => {
switch (action.type) {
case "LOGIN": {
sessionStorage.setItem("token", action.payload.token);
sessionStorage.setItem("user", JSON.stringify(action.payload.user));
return {
...store,
token: action.payload.token,
user: action.payload.user,
isAuthenticated: true
};
}
case "LOGOUT":
sessionStorage.removeItem("token");
sessionStorage.removeItem("user");
return {
...store,
token: null,
user: null,
isAuthenticated: false
};
default:
return store;
}
};

export default storeReducer;
