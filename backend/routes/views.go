package routes

import (
	"backend/controllers"
	"github.com/gorilla/mux"
)

func RegisterViewsRoutes(r *mux.Router) {
	r.HandleFunc("/admin/sync-views", controllers.SyncViewsHandler).Methods("GET")
}
