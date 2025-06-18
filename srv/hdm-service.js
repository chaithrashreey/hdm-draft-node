const { db } = require("@sap/cds");
// module.exports = (srv) => {
//     const { HDMObjects, HDMRelations, DraftAdministrativeData } = srv.entities;
//     console.log(">> HDMService handler loaded");
//     console.log(">> Entities available:", Object.keys(srv.entities));
//     // const draftEntity = srv.entities['HDMObjects.drafts'];

// //    srv.before('CREATE', '*', req => {
// //         console.log(`🔥 BEFORE CREATE — Entity: ${req.target.name}`);
// //     });
//     srv.before('CREATE', '*', async (req) => {
//         if (req.target?.name === 'com.sap.hdm.HDMService.HDMObjects.drafts') {
//             console.log("✅ Draft CREATE triggered for HDMObjects.drafts");
//             console.log("Incoming draft payload:", req.data);
//         }
//     });

//     // const draftEntity = srv.entities['com.sap.hdm.HDMService.HDMObjects.drafts'];

//     // if (!draftEntity) {
//     //     console.error("❌ Entity 'HDMObjects.drafts' not found in srv.entities!");
//     //     return;
//     // }

//     // srv.before('CREATE', draftEntity, async (req) => {
//     //     console.log("✅ Draft CREATE triggered for HDMObjects.drafts");
//     //     console.log("Incoming draft payload:", req.data);
//     // });

//     srv.on ("createDocument", async (req) => {
//         try{
//             const db = cds.transaction(req);
//             const { businessObjectId, businessObjectType, baseObjectType }  = req.data;
//             const hdmObjDraftUUID = cds.utils.uuid();

//             // Step 1: Insert into DraftAdministrativeData
//             await db.run(INSERT.into(DraftAdministrativeData).entries({
//                 DraftUUID: draftUUID,
//                 InProcessByUser: userId,
//                 LastChangedByUser: userId
//             }));

//     //         businessObjectType : String(30);//Slares Order, purchase Order, etc.
//     // key businessObjectId   : String(90);//Sales OrderID, Purchase Order ID, etc.
//     // key baseObjectType     : BaseObjectType;//F,D
//     // key baseObjectId  
//             // Step 3: Create draft for HDMRelations
//             const draftObj = {
//                 businessObjectId,
//                 businessObjectType,
//                 baseObjectType, //F, D
//                 baseObjectId: hdmObjDraftUUID,
//                 IsActiveEntity: false,
//                 HasDraftEntity: false,
//                 DraftAdministrativeData_DraftUUID: draftUUID
//             };
//             await db.run(INSERT.into(HDMRelations.drafts).entries(draftObj));

//             await db.run(INSERT.into(HDMObjects))

//         }catch(err){
//             req.http.res.status(err.status).send({ ...err });
//         }
//     })

// }

const cds = require('@sap/cds');
const { data } = require("@sap/cds/lib/dbs/cds-deploy");

module.exports = (srv) => {
    const { HDMObjects, HDMRelations } = srv.entities;
    srv.on("createDocumentWithLink", async (req) => {
        try{
        const { data: inputData} = req.data;
        const {businessObjectType, businessObjectId, baseObjectType } = inputData;

        const baseObjectId = cds.utils.uuid();
        delete inputData.businessObjectId;
        delete inputData.businessObjectType;

        let draft;

        cds.tx (async() => {
             await srv.new(HDMObjects.drafts, {
               ...inputData,
               baseObjectId
            });
      
        draft = await srv.new(HDMRelations.drafts, {
                baseObjectId,
                baseObjectType,
                businessObjectType,
                businessObjectId
            })
        })
       

        return draft;
    }catch(err){
        console.log("🚀 ~ srv.on ~ err:", err)
        
    }
    });

    srv.on("updateDocumentWithLink", async (req) => {
       const { data: inputData} = req.data;
       const { baseObjectId, baseObjectType } = inputData;
       delete inputData.baseObjectId;
       delete inputData.baseObjectType;

    const response =  await fetch(`http://localhost:4004/odata/v4/hdm/HDMObjects(baseObjectId='${baseObjectId}',baseObjectType='${baseObjectType}',IsActiveEntity=false)`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization // forward auth if needed
            },
            body: JSON.stringify({
               ...inputData,
               baseObjectId
            })
        });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update draft: ${response.status} ${response.statusText} - ${error}`);
    }

    const updatedDraft = await response.json(); // ✅ This gives you the updated entity
    return updatedDraft;   
    });


    srv.on("saveDocumentWithLink", async(req) => {
        const { businessObjectType, businessObjectId } = req.data;

        const relationDraftEntries = await SELECT.from(HDMRelations.drafts).where({
            businessObjectId,
            businessObjectType
        });
    
        for(let eachRelation in relationDraftEntries){
            const { baseObjectId, baseObjectType, ID } = relationDraftEntries[eachRelation];
            await srv.save(HDMObjects.drafts, { baseObjectId,baseObjectType })    // activate draft
            await srv.save(HDMRelations.drafts, { ID }) 
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
            await srv.discard(HDMObjects.drafts, { baseObjectId,baseObjectType })    // activate draft
            await srv.discard(HDMRelations.drafts, { ID })  
        }
             
    })
    
}
