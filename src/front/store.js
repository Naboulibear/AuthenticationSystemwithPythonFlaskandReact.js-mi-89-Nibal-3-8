export const initialStore = {
token: sessionStorage.getItem("token"),
user: JSON.parse(sessionStorage.getItem("user") || "null"),
isAuthenticated: Boolean(sessionStorage.getItem("token"))
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
