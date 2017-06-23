sap.ui.define([], function() {
	"use strict";

  
	return {


	       
		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

	formatPadding: function(sId){
			return String(sId).substring(0, 10);                        
		},
		/**
		 * Returns a configuration object for the {@link sap.ushell.ui.footerbar.AddBookMarkButton} "appData" property
		 * @public
		 * @param {string} sTitle the title for the "save as tile" dialog
		 * @returns {object} the configuration object
		 */
		shareTileData: function(sTitle) {
			return {
				title: sTitle
			};
		},
		//date time formatting
		
		formatDate: function(oDate){
			if(oDate){
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance();
				return oDateFormat.format(oDate,1);
			}else{
				return oDate;
			}
		},
		
		

formatTime	: function(oTime) {                                                            
	var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm:ss"});
	var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;                             
	var timeStr = oTimeFormat.format(new Date(oTime.ms + TZOffsetMs));                      
	return timeStr;                                                                       
},

		
	iconType: function(sIconId) {
				if(sIconId==1){
			 return "sap-icon://sys-enter-2";
				} else if (sIconId==2) {
			return "sap-icon://error";
				}else{
			return "sap-icon://alert";
				}
			},
			
 iconAction: function(sAction) {
     switch(sAction) {
    case "OK":
       return "Approved";
        break;
    case "KO":
        return "Rejected";
        break;
    case "MOVE":
        return "Moved";
        break;
    default:
       return  "Pending";
}	
 },
			
			statusType: function(sIconId){
				if(sIconId==1){
			 return "Success";
				} else if (sIconId==2){
			return "Warning";
				}else{
			return "Error";
				}
			},
				statusText: function(sIconId){
				if(sIconId==1){
			 return "Not Urgent";
				} else if (sIconId==2){
			return "Urgent";
				}else{
			return "Critical";
				}
			}

	};
	


	

}





);