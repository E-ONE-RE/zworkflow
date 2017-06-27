/*global location*/
sap.ui.define([
	"Workflow/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"Workflow/model/formatter"
], function(BaseController, JSONModel, History, formatter, MessageToast, Button) {
	"use strict";

	return BaseController.extend("Workflow.controller.Object", {
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
			    iOriginalBusyDelay2,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		
			
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				oViewModel.setProperty("/busy", false);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
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
		var sSelectedTaskid,  i, sPath, oTask, oTaskId, oView;
            oView=this;
// al momento posso selzionare solo un task per volta, in questa fase di test non mi interessa 
//una seleziona massiva che probailmente il cliente non chiederà, altre al fatto del probela degli  START_PO
// che richiedono la scelta di un nuovo processo da far partire

            //trovo il task id andando a vedere il routing path ricavando la stringa con substring e indexOf
			sSelectedTaskid = this.getRouter().getRoute("object")._oRouter._oRouter._prevMatchedRequest.substring(this.getRouter().getRoute("object")._oRouter._oRouter._prevMatchedRequest.indexOf(",") + 1);
			//////////////////////////////////////////
			
			//if (aSelectedTaskid.length) 
			//{
				//for (i = 0; i < aSelectedTaskid.length; i++) 
				//{
					//oTask = aSelectedTaskid[i];
					
					
		    ///////////////////////////////////////////
					// recupero il taskid selezionato
					//oTaskId = oTask.getBindingContext().getProperty("ZWfTaskid");
					 var oUrlParams = {
				//	 ZWfTaskid : "0000025447",
				     ZWfTaskid : sSelectedTaskid, //modificato passando la stringa come parametro
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
					  
					   
				//}
			//}	
				   function fnS(oData, response) 
				   {
				   	console.log(oData); console.log(response);
				   	
				   	// controllo che la funzione è andata a buon fine recuperando il risultato della function sap
				   	if (oData.Type == "S" )
				   	   {
			alert("Success: "+oData.Message); 
			var oHistory = sap.ui.core.routing.History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	        oModel.refresh();
	        history.back();
				//var bReplace = true;
				//oView.getRouter().navTo("worklist", {}, bReplace);
				// Otherwise we go backwards with a forward history
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
    
		
		
		onShareInJamPress: function() {
			var oViewModel = this.getModel("objectView"),
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

		/**
		 * Event handler  for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("worklist", {}, bReplace);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sObjectId2 = oEvent.getParameter("arguments").objectId2;
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
				var sObjectPath = this.getModel().createKey("TaskSet", {
					ZWfProcid: sObjectId,
					ZWfTaskid: sObjectId2
				});
				this._bindView("/" + sObjectPath );
			}.bind(this));
		
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView");
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						}
						);
					}.bind(this),
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.ZWfProcid,
				sObjectId2 = oObject.ZWfTaskid,
				sObjectName = oObject.ZWfUtente;

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});