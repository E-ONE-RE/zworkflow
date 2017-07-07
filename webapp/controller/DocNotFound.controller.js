sap.ui.define([
	"Workflow/controller/BaseController",
	"sap/ui/core/routing/History"
], function(BaseController,History) {
	"use strict";

	return BaseController.extend("Workflow.controller.DocNotFound", {

	
		onLinkPressed: function() {

	var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("object", {}, bReplace);
			}
		}

	});

});