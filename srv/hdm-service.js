const cds = require('@sap/cds');

module.exports = (srv) => {
    const { HDMObjects, HDMRelations } = srv.entities;
    srv.on("createDocumentWithLink", async (req) => {
        try {   
            const { data: inputData} = req.data;
            const {businessObjectType, businessObjectId, baseObjectType } = inputData;

            const baseObjectId = cds.utils.uuid();
            delete inputData.businessObjectId;
            delete inputData.businessObjectType;

            let draft;
            await cds.tx(req).run(async (tx) => {
                const hdmService = await cds.connect.to('com.sap.hdm.HDMServiceOld'); // your service name here
                const srv = hdmService.tx(tx); // bind service to transaction

                await srv.new(HDMObjects.drafts, {
                    ...inputData,
                    baseObjectId,
                });

                draft = await srv.new(HDMRelations.drafts, {
                    baseObjectId,
                    baseObjectType,
                    businessObjectType,
                    businessObjectId
                });
            });

            return draft;

        } catch(err){
            req.error(500, "Failed to create linked drafts.");      
        }
        });


    srv.on("updateDocumentWithLink", async (req) => {
        try {
            const { data: inputData} = req.data;
            const { baseObjectId, baseObjectType } = inputData;
            delete inputData.baseObjectId;
            delete inputData.baseObjectType;

            const relationDraft = await SELECT.from(HDMRelations.drafts).where({
                baseObjectId,
                baseObjectType
            });

            await cds.tx(req).run(async (tx) => {
                const hdmService = await cds.connect.to('com.sap.hdm.HDMServiceOld');
                const srv = hdmService.tx(tx); 

                //Question do we need to update the updatedAt/modifiedAt timestamp for relations as well ?
                const { ID } = relationDraft[0];
                await srv.update(HDMRelations.drafts).set({
                    modifiedAt: new Date()
                }).where({ 
                    ID,
                    IsActiveEntity: false,
                    'DraftAdministrativeData.InProcessByUser': req.user.id
                });

                await srv.update(HDMObjects.drafts).set({
                    ...inputData,
                    modifiedAt: new Date()
                }).where({ 
                    baseObjectId,
                    IsActiveEntity: false,
                    'DraftAdministrativeData.InProcessByUser': req.user.id
                });
            });


            const updatedDraft = await srv.read(HDMObjects.drafts)
            .where({ 
                baseObjectId,
                IsActiveEntity: false,
                'DraftAdministrativeData.InProcessByUser': req.user.id
            });

            return {
                status  : 200,
                message : "Linked drafts saved successfully!",
                data: updatedDraft
            } 
        } catch(err){
            req.error(500, "Failed to update drafts.",err);   
        }
        
    });


    srv.on("saveDocumentWithLink", async(req) => {
        const { businessObjectType, businessObjectId } = req.data;

        const relationDraftEntries = await SELECT.from(HDMRelations.drafts).where({
            businessObjectId,
            businessObjectType
        });
    
        for(let eachRelation in relationDraftEntries){
            const { baseObjectId, baseObjectType, ID } = relationDraftEntries[eachRelation];
            try {
                //Each doc with it's relation is stored as one transaction
                await cds.tx(req).run(async (tx) => {
                    const hdmService = await cds.connect.to('com.sap.hdm.HDMServiceOld');
                    const srv = hdmService.tx(tx); // bind service to transaction

                    await srv.save(HDMObjects.drafts, { baseObjectId,baseObjectType })    // activate draft
                    await srv.save(HDMRelations.drafts, { ID }) 
                })
            } catch(err) {
                 req.error(500, "Failed to save linked drafts.");    
            }         
        }   
        return {
            status  : 200,
            message : "Linked drafts saved successfully!"
        }        
    })

    srv.on("discardDocumentWithLink", async(req) => {
        const { businessObjectType, businessObjectId } = req.data;

        const relationDraftEntries = await SELECT.from(HDMRelations.drafts).where({
            businessObjectId,
            businessObjectType
        });

        for(let eachRelation in relationDraftEntries){
            const { baseObjectId, baseObjectType, ID } = relationDraftEntries[eachRelation];
            try {
                await cds.tx(req).run(async (tx) => { 
                    const hdmService = await cds.connect.to('com.sap.hdm.HDMServiceOld');
                    const srv = hdmService.tx(tx); // bind service to transaction

                    await srv.discard(HDMObjects.drafts, { baseObjectId,baseObjectType });    // discard draft
                    await srv.discard(HDMRelations.drafts, { ID });
                })

                return {
                    status  : 200,
                    message : "Linked drafts discarded successfully!"
                } 

            } catch(err) {
                 req.error(500, "Failed to discard linked drafts.");    
            }
        }
             
    })

    srv.on("editLinks", async(req) => {
        try {
            const { businessObjectType, businessObjectId } = req.data;
            const relationDraftEntries = await SELECT.from(HDMRelations).where({
                businessObjectId,
                businessObjectType
            });

            for(let eachRelation in relationDraftEntries){
                const { ID } = relationDraftEntries[eachRelation];
                try {
                    await srv.edit(HDMRelations, { ID }) 
                } catch(err) {
                    req.error(500, "Failed to save linked drafts.");    
                }   
                
                return {
                    status  : 200,
                    message : "Link edit success!"
                } 
            } 
        } catch(err){
             req.error(500, "Failed to edit link");
        }    
    })

     srv.on("editDocument", async(req) => {
        try {
            //Here we are assuming that the relation on the particular document is already in edit mode.
            //Is this correct? Because only if the Business Object goes to edit mode, it can edit documents as well right?
            //Without the business object going into edit mode can we edit the documents?

            //DO we need a different endpoint then to save the link and save the document.
            const { baseObjectId, baseObjectType } = req.data;
            await srv.edit(HDMObjects, { baseObjectId, baseObjectType })  
            
            return {
                status  : 200,
                message : " Document edit success!"
            } 
        } catch(err){
             req.error(500, "Failed to edit document");
        }    
    })
    
}
