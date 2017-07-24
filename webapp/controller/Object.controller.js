/*global location*/
sap.ui.define([
	"Workflow/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"Workflow/model/formatter"
], function(BaseController, JSONModel, History, formatter, MessageToast, MessageStrip, 	MessageBox, Button, Dialog, Input, Label, SuggestionItems, Item, Template) {

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
		actionTask: function(oEvent) {

			var sButtonId, sButtonComment;
			var oView, oViewW;
			var sSelectedTaskid;
			var sAction, sUser, sUname; //sUser e sUname rappresentano delle variabili di appoggio
			//var  i, sPath, oTask, oTaskId; (variabili inutilizzate)
			if(this.Comment){
			sButtonComment = sap.ui.getCore().byId("buttonOk").getId();
			}


			oView = this.getView();
			var oObject = oView.getBindingContext().getObject();

			if (this._oPopover) {
				this._oPopover.close();
				sap.ui.getCore().byId("combo").setValue("");
				sUname = this.sKey;
			}

			if (this.Dialog) {
				this.Dialog.close();
			}

			sButtonId = oEvent.getSource().getId();

			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
			if (sButtonId == sButtonComment) {

				var sTask, sProcid, sComment;
				sTask = oObject.ZWfTaskid;
				sProcid = oObject.ZWfProcid;
				sComment = sap.ui.getCore().byId("feed").getValue();

				if (sComment != "") {
					var oUrlParams = {
						ZWfTaskid: sTask,
						ZWfProcid: sProcid,
						ZWfComment: sComment
					};

					var oModel = this.getModel();
					oModel.callFunction("/ZWfPostComment", {
						method: "POST",
						urlParameters: oUrlParams,

						success: function(oData, oResponse) {
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.show("The comment has been successfully published.", {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Success",
								onClose: null,
								styleClass: "sapUiSizeCompact",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit,
								contentWidth: "100px"
							});
						},

						error: function(oError) {
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.show("Something went wrong! Please try to post the comment later.", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								onClose: null,
								styleClass: "sapUiSizeCompact",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit,
								details: 'Possible reasons:\n' +
									'You are not connected to the internet, ' +
									'a backend component is not available ' +
									'or an underlying system is down. ' +
									'Please contact your system administrator to get more informations.',
								contentWidth: "100px"
							});
						}

					});
					var oCommentList = oView.byId("commentList");
					oCommentList.getBinding("items").refresh();
					this.Comment.setState("None");
					this.Comment.setTitle("");
					this.Comment.close();
					sap.ui.getCore().byId("feed").setValue("");

				} else {

					this.Comment.setState("Error");
					this.Comment.setTitle("You should add a comment to save!");

				}

			} else {

				sButtonId = this.sButtonKey;

				/** MP
				 * La forma oView.byId(<sID statico>).getId() è importante da mantenere
				 * in quanto una volta che l'applicazione è deployata ed eseguita sul server
				 * il prefisso dell'id statico cambia. Referenziando il controllo con il suo 
				 * id staticoutilizzando questa forma fa si che il controllo e la logica 
				 * applicata ad esso o a partire da azioni su di esso non cambi in dipendenza 
				 * dell'ambiente di esecuzione e del prefisso applicato. 
				 * FORMA PRECEDENTE: (sButtonId == "application-zworkflow-display-component---object--btn1") 
				 */
				if (sButtonId == oView.byId("btn1").getId()) {
					sAction = "OK";
					sUname = undefined;
				} else if (sButtonId == oView.byId("btn2").getId()) {
					sAction = "KO";
					sUname = undefined;
				}

				sUser = "";
				if (sUname != undefined) {
					sAction = "MOVE";
					sUser = sUname;
				}

				//recupero taskid (SE)

				sSelectedTaskid = oObject.ZWfTaskid;

				// al momento posso selzionare solo un task per volta, in questa fase di test non mi interessa 
				//una seleziona massiva che probailmente il cliente non chiederà, altre al fatto del probela degli  START_PO
				// che richiedono la scelta di un nuovo processo da far partire

				//trovo il task id andando a vedere il routing path ricavando la stringa con substring e indexOf
				//sSelectedTaskid = this.getRouter().getRoute("object")._oRouter._oRouter._prevMatchedRequest.substring(this.getRouter().getRoute("object")._oRouter._oRouter._prevMatchedRequest.indexOf(",") + 1);
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
					//ZWfTaskid : "0000025000",
					ZWfTaskid: sSelectedTaskid, //modificato passando la stringa come parametro
					ZWfActionType: sAction,
					ZWfUser: sUser
				};
				//var oView = this.getView();
				//oModel = this.getModel(),
				var oModel = this.getModel();
				// lancio la function import creata sull'odata
				oModel.callFunction("/ZWfAction", {
					method: "POST",
					urlParameters: oUrlParams,
					success: fnS,
					error: fnE
				});

				//}

				//}	

			}

			function fnS(oData, response) {
				console.log(oData);
				console.log(response);

				// controllo che la funzione è andata a buon fine recuperando il risultato della function sap
				if (oData.Type == "S") {
					var msg = "Success: "+oData.Message;
        					sap.m.MessageToast.show(msg, { duration: 5000,
        					autoClose: true,
        					 closeOnBrowserNavigation: false
        						
        					});
					//	alert("Success: "+oData.Message);
					/** MP
					 *  Recupero il prefisso che viene messo di default alle viste nell'app.
					 *  Stesso discorso fatto sopra per i bottoni. Piuttosto che avere il 
					 *  prefisso statico dichiarato me lo ricavo. In questo modo l'applicazione
					 *  svolge le correttamente le funzionalità indipendentemente dall'ambiente
					 *  di run.
					 */
					var sPrefix = oView.getId().substring(0, oView.getId().indexOf("---")) + "---"; // equivale ad "application-zworkflow-display-component---"
					oViewW = sap.ui.getCore().byId(sPrefix + "worklist");
					var oTable = oViewW.byId("table");
					oTable.getBinding("items").refresh();
					sap.ui.controller("Workflow.controller.Object").onNavBack(); //richiama una funzione di Object.Controller con questa sintassi
				} else {
					//richiama una funzione di Object.Controller con questa sintassi

							//		alert("Error: "+oData.Message); 
							
						jQuery.sap.require("sap.m.MessageBox");
			            sap.m.MessageBox.show(
					      "Error: "+oData.Message, {
					          icon: sap.m.MessageBox.Icon.WARNING,
					          title: "Error",
					          actions: [sap.m.MessageBox.Action.CLOSE]
					          
					      }
					    );
				}

			}

			function fnE(oError) {
				console.log(oError);

				alert("Error in read: " + oError.message);
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

		/**
		 * Function per il lazy loding
		 */

		/* onRequestLoad: function(oEvent){
		oEvent.getSource().getBinding("items").resume();
		 },*/

		// test per refresh view. non utilizzato al momento (SE)
		onSelectChanged: function(oEvent) {
			var key = oEvent.getParameters().key;
			if (key == "2") {
				var oView2 = sap.ui.getCore().byId(this.getView().getId()); //sostituito per i motivi elencati sopra per i bottoni
				//sap.ui.getCore().getElementById("Workflow.controller.Object").getController().onOpenDoc();
				//var oController = sap.ui.controller("Workflow.controller.Object").onOpenDoc();
				//	var oView2 = sap.ui.getCore().byId("application-zworkflow-display-component---worklist");
				//		     var oTable = oView2.byId("table");
				//		     oTable.getBinding("items").refresh();
				//var oController = sap.ui.controller("Workflow.controller.Object");
				//	oController.onOpenDoc();
				sap.ui.getCore().byId(this.getView().getId()).getModel().refresh(true);
			}

		},

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
		onNavBack: function(oEvent) {
			
			if(oEvent){
			////////SE su pressione tasto back faccio refresh tabella taskset
			var oView, oViewW;
			oView = this.getView();
			var sPrefix = oView.getId().substring(0, oView.getId().indexOf("---")) + "---"; // equivale ad "application-zworkflow-display-component---"
					oViewW = sap.ui.getCore().byId(sPrefix + "worklist");
					var oTable = oViewW.byId("table");
					oTable.getBinding("items").refresh();
			////////
			}
					
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



        // evento button per apertura pdf odc (SE) per visualizzazione embedded in view DOC
	/*	onOpenDoc: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},*/
		
		 // evento button per apertura pdf odc (SE) per apertura diretta
		onOpenDoc: function(oEvent) {
			//var OData = new sap.ui.mode.odata.ODataModel(); 
		    //jQuery.sap.require("sap.ui.model.odata.datajs");
			var service = "http://10.126.72.12:50040";
			var oView = this.getView();
			var oObject = oView.getBindingContext().getObject();
			var oModel = this.getModel();

			var sRead = "/PdfdocSet(ZWfProcid='" + oObject.ZWfProcid + "',ZWfTaskid='" + oObject.ZWfTaskid + "',ZWfDocument='" + oObject.ZWfDocument + "',ZWfTipodoc='" + oObject.ZWfTipodoc + "')";
			   
				oModel.read( sRead, {
				 
				 	success: function (oData) {
				 		console.log(oData); 
				               window.open(service + oData.url, '_blank');
							//	win.focus();
					},
				
				/*	error: function(){
			            alert("No document available");
					}*/
				
					error: function() {
						jQuery.sap.require("sap.m.MessageBox");
			            sap.m.MessageBox.show(
					      "Error: No document available", {
					          icon: sap.m.MessageBox.Icon.WARNING,
					          title: "Error",
					          actions: [sap.m.MessageBox.Action.CLOSE]
					          
					      }
					    );
					}	    
					/*	error: function() {
						
						jQuery.sap.require("sap.m.MessageBox");
			            sap.m.MessageBox.show(
					      "This message should appear in the message box.", {
					          icon: sap.m.MessageBox.Icon.INFORMATION,
					          title: "My message box title",
					          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO]
					          
					      }
					    );
			    
						}*/
	
				});
			            
		},	
		
		//event for attachments
  /*     onItemPress: function(){
          var msg = "This is a test of itemPress!";
          sap.m.MessageToast.show(msg);
    },*/
    
    //non utilizzata
       onItemPress: function(oEvent){
       	
		       	 oEvent.getSource().getBindingContext().getProperty("Num");
		       	 //Give the row data which are visible in the screen 
		 //var oSelectedItem = sap.ui.getCore().byId("Attach_table").getSelectedItems(); 
		  
		//       	this.byId("Attach_table").getTable().attachItemPress(this.handleRowPress);
		//          var msg = "This is a test of itemPress!";
		//          sap.m.MessageToast.show(msg);
    },
    
    //evento per apertura allegati
    handleLineItemPress : function(evt) {
	    //console.log('evt.getSource: ' + evt.getSource());
	    //console.log('evt.getBindingContext: ' + evt.getSource().getBindingContext());
		//var oItem = evt.getParameter("Num").getBindingContext().getObject();
		//NB: if using standard sap.ui.table.Table, use: 
		var oItem = evt.getSource().getBindingContext().getObject(); 
		//console.log(oItem); //prints the JSON for your selected table row
	 
		  var oView = this.getView();
		  var oObject = oView.getBindingContext().getObject();
		  var oModel = this.getModel();
				
		  var sRead = "/PDFSet(PDoc='" + oObject.ZWfDocument + "',PProc='" + oObject.ZWfProcesso + "',PDocCount='" + oItem.Num + "')" + "/$value" ;
		   
		//   window.open("http://10.126.72.12:50040/sap/opu/odata/SAP/ZWORKFLOW_SRV" + sRead );
		   var url = "http://10.126.72.12:50040/sap/opu/odata/SAP/ZWORKFLOW_SRV";
		   var url2 = url + sRead;
		   //window.open(url2);
		   
		   var win=window.open(url2, '_blank');
		   win.focus();
   
   
			//   jQuery.sap.require("sap.m.URLHelper");
			
			//   sap.m.URLHelper.redirect("http://10.126.72.12:50040/sap/opu/odata/SAP/ZWORKFLOW_SRV" + sRead, true);
			  
			 /*      oModel.read( sRead, null, null, true, function(oData, oResponse){
			                     var pdfURL = oResponse.requestUri;            
			  //          html.setContent("<iframe src=" + pdfURL + " width='700' height='700'></iframe>");
			               
			        },function(){
			            alert("Read failed");});*/
  
     },
		
	

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * 
		 *MOVE 
		 * 
		 */

		//Method to show the Popover Fragment
		showPopover: function(oEvent) {
			var that = this;
		
			if (!that._oPopover) {

				that._oPopover = sap.ui.xmlfragment("Workflow.view.Popover", this, "Workflow.controller.Object");
				//to get access to the global model
				this.getView().addDependent(that._oPopover);
			}
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oPopover.openBy(oButton);
			    sap.ui.getCore().byId("combo").setValue("");//Cancella il contenuto del comboBox nel Popover.
			});

 		 if (sap.ui.Device.system.phone) {
				/** MP
				 * Su smartphone l'input field non funziona a dovere 
				 * le seguenti righe di codice servono per disabilitare
				 * l'autocomplete e l'autoselect.
				 */
				var oComboBox = sap.ui.getCore().byId("combo");
				oComboBox.addEventDelegate({
					onkeydown: function(oEvent) {
							if (oEvent.which == 8) {
								oComboBox.setValue("");
							}
					}
				});
		}

		},

		//Show confirmation dialog
		showDialog: function(oEvent) {
			var that = this;
			this.sButtonKey = oEvent.getSource().getId(); //mi salvo il valore chiave del bottone per la gestione dei conflitti in actionTask
			if (!that.Dialog) {

				that.Dialog = sap.ui.xmlfragment("Workflow.view.Dialog", this, "Workflow.controller.Object");
				//to get access to the global model
				this.getView().addDependent(that.Dialog);
				if (sap.ui.Device.system.phone) {
					that.Dialog.setStretch(true);
				}
			}
			that.Dialog.open();
		},

		//Comments Dialog
		shareAddComment: function(oEvent) {
			var that = this;
			this.sButtonComment = oEvent.getSource().getId();
			if (!that.Comment) {

				that.Comment = sap.ui.xmlfragment("Workflow.view.Comment", this, "Workflow.controller.Object");

				//to get access to the global model
				this.getView().addDependent(that.Comment);
				if (sap.ui.Device.system.phone) {
					that.Comment.setStretch(true);
				}
			}
			that.Comment.open();
		},

	

		//Close Dialog
		closeDialog: function() {
			if (this.Comment) {
				this.Comment.setState("None");
				this.Comment.setTitle("");
				sap.ui.getCore().byId("feed").setValue("");
				this.Comment.close();
			}
			if (this.Dialog) {
				this.Dialog.close();
				this.sButtonKey = undefined; //per controllare i conflitti in actionTask N.B.
			}
		},

		//Method to handle cancel on the Popover for user selection
		closePopover: function() {
			this._oPopover.close();
		},

		//Method to retrieve the selected key from the comboBox in Popover.fragment.xml		
		selectionChange: function(oEvent) {

			this.sKey = oEvent.getSource().getProperty("selectedKey");
			return this.sKey;
		},

		//Method to load the Date just once requested
		lazyLoadItems: function(oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * MP
		 * 
		 * Event handler for comment List binding and configuration on phone
		 * 
		 */

		fnEventHandler: function(oObjectView) {

			/**
			 * MP
			 * Binding alla lista per i commenti con filtro sul documento 
			 *
			 * Se l'app è visualizzata su smartphone allora lo  
			 * Status (Not Urgent, Urgent...) non è visualizzato
			 */

			var oObject = oObjectView.getBindingContext().getObject();
			var sDocumentId = oObject.ZWfDocument;
			this._sDocumentId = sDocumentId;
			var oList = oObjectView.byId("commentList");
			var oFilters = new sap.ui.model.Filter("DocumentId", sap.ui.model.FilterOperator.EQ,
				sDocumentId); // Dynamic parameter
			oList.bindItems({
				path: "/NoteSet",
				template: oList.getBindingInfo("items").template,
				filters: oFilters
			});

			/**
			 * MP
			 *
			 * Usato per nascondere il footer quando il focus è sul FeedInput
			 * In questo modo, quando un utente clicca sul FeedInput da smartphone,
			 * il footer non si posiziona sulla tastiera perchè viene nascosto.
			 */
			if (sap.ui.Device.system.phone) {
				/** MP
				 * Prova per nascondere il footer!
				 * Adesso commentata perchè non più necessario.
				 * 
				var oFeedInput = oObjectView.byId("feed");
				oFeedInput.addEventDelegate({
					onfocusin: function() {
						var oPage = sap.ui.getCore().byId("__page0");
						oPage.addDelegate({
							onAfterRendering: function() {
								this.$().removeClass("sapMPageWithFooter");
							}
						}, oPage);

						oObjectView.byId("footerToolbar").setVisible(false);
					},

					onfocusout: function() {
						oObjectView.byId("footerToolbar").setVisible(true);
					}
				});
				*/

				// Lo status nell'header non viene visualizzato su smartphone
				var oHeader = oObjectView.byId("objHead");
				var aStatuses = oHeader.getStatuses();
				aStatuses[2].setVisible(false);
			}

		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */

		/**
		 * (MP): Inserito ---this.getModel().setSizeLimit(1000);--- in _onObjectMatched 
		 * per fare in modo che il controllo "ComboBox" istanziato nella funzione "showDialog" 
		 * mostri tutti gli elementi, altrimenti limitati a 100
		 */
		_onObjectMatched: function(oEvent) {
			this.getModel().setSizeLimit(1000);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sObjectId2 = oEvent.getParameter("arguments").objectId2;
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function() {
				var sObjectPath = this.getModel().createKey("TaskSet", {
					ZWfProcid: sObjectId,
					ZWfTaskid: sObjectId2
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));

		},

		// evento per binding vista doc per pdf
		_showObject: function(oItem) {
			this.getRouter().navTo("doc", {
				objectId: oItem.getBindingContext().getProperty("ZWfProcid"),
				objectId2: oItem.getBindingContext().getProperty("ZWfTaskid"),
				objectId3: oItem.getBindingContext().getProperty("ZWfDocument"),
				objectId4: oItem.getBindingContext().getProperty("ZWfTipodoc")
			});
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
						});
					}.bind(this),
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});

			var oView = this.getView();

			sap.ui.controller("Workflow.controller.Object").fnEventHandler(oView);

		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			/**
			 * MP
			 * The following line of code are used to update the binding of the 
			 * comment List.
			 * If the Object page is reloaded, the comments will be visible.
			 */
			///////////////////////////////////////////////////////////////////////////////////////////////////////////	
			sap.ui.controller("Workflow.controller.Object").fnEventHandler(oView);
			///////////////////////////////////////////////////////////////////////////////////////////////////////////

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.ZWfProcid,
				sObjectId2 = oObject.ZWfTaskid,
				sObjectId3 = oObject.ZWfDocument,
				sObjectId4 = oObject.ZWfTipodoc,

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