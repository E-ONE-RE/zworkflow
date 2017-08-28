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
			
			/// SE refresh ogni 10 minuti tabella taskset
			setInterval(function(){
     		oTable.getBinding("items").refresh();
     		
     		 var msg = "Updating..";
        					sap.m.MessageToast.show(msg, { duration: 3000,
        					autoClose: true,
        					 closeOnBrowserNavigation: true
        					});
        					
    		},600000);
    		  
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

		/** MP
		 * To refresh the binding of the table listing the tasks.
		 * If the user clicks the refresh button in the header
		 * thus action is triggered.
		 */
		onClickRefresh: function() {
			var oView = this.getView();
			var oTable = oView.byId("table");
			oTable.getBinding("items").refresh();

			var msg = "Updated";
			sap.m.MessageToast.show(msg, {
				duration: 1500, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});


		},

		onQuickFilter: function(oEvent) {
			var sKey = oEvent.getParameter("selectedKey"),
				_sKey = sKey,
				oFilter = this._mFilters[sKey],
				oBinding = this._oTable.getBinding("items");

			if (oFilter) {
				oBinding.filter(oFilter);
			} else {
				oBinding.filter([]);
			}
		},

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
				jQuery.each(this._mFilters, function(sFilterKey, oFilter) {
					oModel.read("/TaskSet/$count", {
						filters: oFilter,
						success: function(oData) {
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
		
		
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/**
		 * MP: 
		 * Modifiche per apporvare, rifiutare o muovere più task contemporaneamente
		 * dalla vista di tutti i task.
		 */ 
		 
			//Method to show the Popover Fragment
		showPopover: function(oEvent) {
			var that = this;
			this.sKey = undefined; //(SE) ripulisco key popover
		    this.Dialog = undefined;  //(SE) ripulisco dialog
		    //this.sButtonKey = undefined; //(SE) ripulisco button del dialog
		    this.sButtonKey = oEvent.getSource().getId();
			if (!that._oPopover) {

				that._oPopover = sap.ui.xmlfragment("Workflow.view.Popover", this, "Workflow.controller.Worklist");
				//to get access to the global model
				this.getView().addDependent(that._oPopover);
			}
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oPopover.openBy(oButton);
			    sap.ui.getCore().byId("combo").setValue("");//Cancella il contenuto del comboBox nel Popover.
			});

 	
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
	

		},

		//Show confirmation dialog
		showDialog: function(oEvent) {
			var that = this;
			this.sKey = undefined; //(SE) ripulisco key popover
			this._oPopover = undefined; //(SE) ripulisco popover
			this.sButtonKey = oEvent.getSource().getId(); //mi salvo il valore chiave del bottone per la gestione dei conflitti in actionTask
			if (!that.Dialog) {

				that.Dialog = sap.ui.xmlfragment("Workflow.view.Dialog", this, "Workflow.controller.Worklist");
				//to get access to the global model
				this.getView().addDependent(that.Dialog);
				if (sap.ui.Device.system.phone) {
					that.Dialog.setStretch(true);
				}
			}
			that.Dialog.open();
		},
		
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


/**
 * MP: Azioni per selezione multipla
 */
	   actionTask: function() {

			var sButtonId;
			var sTypeAction;
			var oView, oViewW;
			var sSelectedTaskid;
			var sAction, sUser, sUname; //sUser e sUname rappresentano delle variabili di appoggio
			//var  i, sPath, oTask, oTaskId; (variabili inutilizzate)
			
			//MP: aggiungo array che contiene i task ID selezionati nel multiselect 
		
			var aSelectedTaskid = this.byId("table").getSelectedItems();
			
			oView = this.getView();
			
			//MP
			//var oObject = oView.getBindingContext().getObject();
		
            ////////////////////////////////// (SE)
            //START - MOVE ACTION POPOVER CHECK 
			if (this._oPopover) {
				this._oPopover.close();
				sap.ui.getCore().byId("combo").setValue("");
				sUname = this.sKey;
			//	this.sButtonKey = undefined; //SE 31072017 ripulisco variabile OK-KO in caso di MOVE
				
				if (sUname == undefined || sUname == "")   {
					
				jQuery.sap.require("sap.m.MessageBox");
			            sap.m.MessageBox.show(
					      "Error: Please, select a valid user", {
					          icon: sap.m.MessageBox.Icon.ERROR,
					          title: "Error",
					          actions: [sap.m.MessageBox.Action.CLOSE]
					      }
					    );
					    return; // se popover è in errore termino la function
				}
			}
			////// END - MOVE ACTION POPOVER CHECK
			
			/////////////////////////////////// (SE)
			//START - APPROVE-REJECT ACTION DIALOG CHECK 
			if (this.Dialog) {
				this.Dialog.close();
			
			}
            ////// END - MOVE ACTION POPOVER CHECK
            

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
						 
						 sUser  = "";
						 sAction = undefined;
						 
						 sTypeAction = undefined;
						if (sButtonId == oView.byId("button1").getId()) {
							sAction = "OK";
							sTypeAction = "Tasks approved";
							sUname = undefined;
						} else if (sButtonId == oView.byId("button2").getId()) {
							sAction = "KO";
							sTypeAction = "Tasks rejected";
							sUname = undefined;
						//(SE)
				    	} else if ((sButtonId == oView.byId("button3").getId()) && (sUname != undefined))  {
						    sAction = "MOVE";
						    sTypeAction = "Tasks moved";
							sUser = sUname;
						}
						
						//MP: Chiamata a ZWfAction passando di volta in volta gli elementi dell'array
						//(Taskid selezionati)
						
						if(aSelectedTaskid.length){
							for(var i = 0; i < aSelectedTaskid.length; i++){
							var oTask = aSelectedTaskid[i];
					        var sTaskId = oTask.getBindingContext().getProperty("ZWfTaskid");
					        var aBatchChanges = [];
					        
							var oUrlParams = {
							//ZWfTaskid : "0000025000",
							ZWfTaskid: sTaskId, //modificato passando la stringa come parametro
							ZWfActionType: sAction,
							ZWfUser: sUser
						};
						
						//var oView = this.getView();
						//oModel = this.getModel(),
						var oModel = this.getModel();
						oModel.setUseBatch(false); // una operazione per volta altrimenti va in errore
						// lancio la function import creata sull'odata
						oModel.callFunction("/ZWfAction", {
							method: "POST",
							urlParameters: oUrlParams,
							success: fnS,
							error: fnE
						});
		                   }
						}else{
							return;
						}
		
				
					


					function fnS(oData, response) {
						console.log(oData);
						console.log(response);
		
						// controllo che la funzione è andata a buon fine recuperando il risultato della function sap
						if (oData.Type == "S") {
							var msg = "Success: "+oData.Message+", "+sTypeAction;
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
							 
							 //MP: parte commentata perchè usata solo in nella vista di dettaglio
							 
							//var sPrefix = oView.getId().substring(0, oView.getId().indexOf("---")) + "---"; // equivale ad "application-zworkflow-display-component---"
							//oViewW = sap.ui.getCore().byId(sPrefix + "worklist");
							//var oTable = oViewW.byId("table");
							var oTable = oView.byId("table");
							oTable.getBinding("items").refresh();
							//sap.ui.controller("Workflow.controller.Object").onNavBack(); //richiama una funzione di Object.Controller con questa sintassi
						} else {
							//richiama una funzione di Object.Controller con questa sintassi
		
									//		alert("Error: "+oData.Message); 
									
								jQuery.sap.require("sap.m.MessageBox");
					            sap.m.MessageBox.show(
							      "Error: "+oData.Message, {
							          icon: sap.m.MessageBox.Icon.WARNING,
							          title: "Error",
							          actions: [sap.m.MessageBox.Action.CLOSE]
							          
							      });
								  
								}

					}// END FUNCTION SUCCESS

					function fnE(oError) {
						console.log(oError);
		
						alert("Error in read: " + oError.message);
					}
					
				          // var oTable = oView.byId("table");
						//	oTable.getBinding("items").refresh();

		},
		
		
		
       ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
       
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