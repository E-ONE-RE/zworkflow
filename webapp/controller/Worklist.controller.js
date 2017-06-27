sap.ui.define([
	"Workflow/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"Workflow/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter) {
	"use strict";


	return BaseController.extend("Workflow.controller.Worklist", {

		formatter: formatter,
	
		
		//Filter
			_mFilters: {
				lessUrgent: [new sap.ui.model.Filter("IconId", "EQ", 1)],
				Urgent: [new sap.ui.model.Filter("IconId", "EQ", 2)],
				moreUrgent: [new sap.ui.model.Filter("IconId", "EQ", 3)]
			},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");
                this._oTable = oTable;
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableBusyDelay: 0,
			    lessUrgent: 0,
				Urgent: 0,
				moreUrgent: 0
			});
			this.setModel(oViewModel, "worklistView");

			
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		 
		 //Quick Filter
		 
		 	onQuickFilter: function(oEvent) {
			   var sKey = oEvent.getParameter("selectedKey"),
			        _sKey= sKey,
					oFilter = this._mFilters[sKey],
					oBinding = this._oTable.getBinding("items");
                    
				if (oFilter) {
					oBinding.filter(oFilter);		   		   	
				} else {
					oBinding.filter([]);	
				}
			},

//Filtro da implementare su SEGW se vogliamo mettere il SearchField
/*
	    //Search Bar
	    onSearch: function(oEvent){
	     var aFilters = [];
    var sQuery = oEvent.getSource().getValue();
     if (sQuery && sQuery.length > 0) {       //here name is the field on which the filter has to be done.
      var filter = new sap.ui.model.Filter("ZWfTaskid", sap.ui.model.FilterOperator.Contains, sQuery);
      aFilters.push(filter);
     	
     }
     // update list binding
     var list = this.getView().byId("worklistView");
    var binding = list.getBinding("items");
     binding.filter(aFilters);
     },
*/			
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				oModel = this.getModel(),
					oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				jQuery.each(this._mFilters, function (sFilterKey, oFilter) {
						oModel.read("/TaskSet/$count", {
							filters: oFilter,
							success: function (oData) {
								var sPath = "/" + sFilterKey;
								oViewModel.setProperty(sPath, oData);
							}
						});
					});
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},
		
		/*onApproveTask: function() {
			var aSelectedTaskid,  i, sPath, oTask, oTaskId;

			aSelectedTaskid = this.byId("table").getSelectedItems();
			if (aSelectedTaskid.length) {
				for (i = 0; i < aSelectedTaskid.length; i++) {
					oTask = aSelectedTaskid[i];
					oTaskId = oTask.getBindingContext().getProperty("ZWfTaskid");
					sPath = oTask.getBindingContextPath();
					this.getModel().remove(sPath, {
						success : this._handleUnlistActionResult.bind(this, oTaskId, true, i+1, aSelectedTaskid.length),
						error : this._handleUnlistActionResult.bind(this, oTaskId, false, i+1, aSelectedTaskid.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},*/
		
		/*
			onApproveTask: function() {
		
OData.request
({
 requestUri: "http://gwserver:8000/sap/opu/odata/sap/Z_UI5_USER_MAINT_CM/z_ui5_user_maintCollection('AGAMPA')",
 method: "GET",
 headers:
 {     
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/atom+xml",
                        "DataServiceVersion": "2.0",        
                        "X-CSRF-Token":"Fetch"    
 } 
	
}
);

			}, 	*/

/*function fnS(){

  alert("ok in read");

  }

function fnE(oError){

         alert("Error in read");

  }
			},
  */
/////////////////////////////////////////////////////////////////////  
		onApproveTask: function() 
	{
		var aSelectedTaskid,  i, sPath, oTask, oTaskId;

// al momento posso selzionare solo un task per volta, in questa fase di test non mi interessa 
//una seleziona massiva che probailmente il cliente non chiederà, altre al fatto del probela degli  START_PO
// che richiedono la scelta di un nuovo processo da far partire

			aSelectedTaskid = this.byId("table").getSelectedItems();
			if (aSelectedTaskid.length) 
			{
				for (i = 0; i < aSelectedTaskid.length; i++) 
				{
					oTask = aSelectedTaskid[i];
					// recupero il taskid selezionato
					oTaskId = oTask.getBindingContext().getProperty("ZWfTaskid");
					
					 var oUrlParams = {
				//	 ZWfTaskid : "0000025447",
				     ZWfTaskid : oTaskId,
					  ZWfActionType : "OK"
					  };
					  //var oView = this.getView();
					  //oModel = this.getModel(),
					  var oModel = this.getModel();
					  // lancio la function import creata sull'odata
					  oModel.callFunction("/ZWfAction", {
					  method:"POST",
					  urlParameters: oUrlParams,
					  success: fnS,
					  error: fnE });
					  
					   
				}
			}	
				   function fnS(oData, response) 
				   {
				   	console.log(oData); console.log(response);
				   	
				   	// controllo che la funzione è andata a buon fine recuperando il risultato della function sap
				   	if (oData.Type == "S" )
				   	   {
							alert("Success: "+oData.Message); 
					     	location.reload(true); 
				   	   }
				   	   
					else { 
							alert("Error: "+oData.Message); 
						 }
					
				   }
							  
					function fnE(oError)
					{
				    console.log(oError);
					alert("Error in read: "+oError.message);
					}
					  
	}, 
/////////////////////////////////////////////////////			
			
/*						onApproveTask: function() {
		    var oURLParameters =  {
 ZWfTaskid : "0000020832",
  ZWfActionType : "OK"
  };
  this._oModel.callFunction("/ZWfAction", {

  method: "POST",

  urlParameters: oURLParameters,
   success: fnS,

  error: fnE
  });
  
  function fnS(){

   alert("Success");

  }

  function fnE(){

         alert("Error in read");

  }
  
						},*/
						
/*	onApproveTask: function() {
	this.oModel.callFunction("ZWfAction", "POST", null, null, fnS, fnE);

	function fnS(){

   alert("Success");

  }

  function fnE(){

         alert("Error in read");

  }		

},*/


/*	onApproveTask: function() {
var OData = new sap.ui.mode.odata.ODataModel(); 		
OData.request
({
 requestUri: "http://gwserver:8000/sap/opu/odata/sap/Z_UI5_USER_MAINT_CM/z_ui5_user_maintCollection('AGAMPA')",
 method: "GET",
 headers:
	 {     
	                        "X-Requested-With": "XMLHttpRequest",
	                        "Content-Type": "application/atom+xml",
	                        "DataServiceVersion": "2.0",        
	                        "X-CSRF-Token":"Fetch"    
	 }
 }, 
 
 function(data, response) {
 	header_xcsrf_token = response.headers['x-csrf-token'];
 	var oHeaders = {
 		"x-csrf-token" : header_xcsrf_token,
 		'Accept' : 'application/json',
 };
 
 OData.request
({
 requestUri: "http://gwserver:8000/sap/opu/odata/sap/Z_UI5_USER_MAINT_CM/z_ui5_user_maintCollection('AGAMPA')",
 method: "POST",
 headers : oHeaders,
 data:oEntry
	},
	function(data,request){
		alert("success");
		location.reload(true);
	}, function(err){
		alert("error");
		
	});
	
 }, function(err) {
 	var request =err.request;
 	var response = err.response;
 	alert("error");
 });
 },*/
                                        
		
		/* codice di esempio da implementare per approvazione task da pulsante
		<!--
		onApproveTask: function() {
			var aSelectedProducts, i, sPath, oProduct, oProductId;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					oProduct = aSelectedProducts[i];
					oProductId = oProduct.getBindingContext().getProperty("ProductID");
					sPath = oProduct.getBindingContextPath();
					this.getModel().remove(sPath, {
						success : this._handleUnlistActionResult.bind(this, oProductId, true, i+1, aSelectedProducts.length),
						error : this._handleUnlistActionResult.bind(this, oProductId, false, i+1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},
       */
       
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ZWfProcid"),
			    objectId2: oItem.getBindingContext().getProperty("ZWfTaskid")
			});
		},

		/**
		 * Sets the item count on the worklist view header
		 * @param {integer} iTotalItems the total number of items in the table
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				this.oViewModel.setProperty("/worklistTableTitle", sTitle);
			}
		}

	});

});