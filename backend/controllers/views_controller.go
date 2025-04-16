package controllers

import (
	"backend/jobs"
	"backend/utils"
	"net/http"
)

func SyncViewsHandler(w http.ResponseWriter, r *http.Request) {
	err := jobs.SyncPropertyViewsToMongo()
	if err != nil {
		utils.WriteErrorResponse(w, "Failed to sync property views", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, map[string]string{
		"message": "View recorded successfully",
	}, http.StatusOK)
}

//Go to a service like cron-job.org or EasyCron.
//
//Create a new cron job and set the schedule (e.g., every 10 minutes).
//
//Enter the URL of your endpoint (e.g., https://your-app-name.onrender.com/admin/sync-views).
//
//This external service will now hit the /admin/sync-views endpoint periodically, triggering your batch job.
