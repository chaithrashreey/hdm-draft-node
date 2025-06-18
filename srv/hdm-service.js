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

        //CreateHDMObjectDraft
        // await fetch('http://localhost:4004/odata/v4/hdm/HDMObjects', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': req.headers.authorization // forward auth if needed
        //     },
        //     body: JSON.stringify({
        //        ...inputData,
        //        baseObjectId
        //     })
        // });

       const data =  await srv.new(HDMObjects.drafts, {
               ...inputData,
               baseObjectId
            });
       console.log("🚀 ~ srv.on ~ data:", data)
       

        //CreateRelationsDraft
        // const res = await fetch('http://localhost:4004/odata/v4/hdm/HDMRelations', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': req.headers.authorization // forward auth if needed
        //     },
        //     body: JSON.stringify({
        //         baseObjectId,
        //         baseObjectType,
        //         businessObjectType,
        //         businessObjectId
        //     })
        // });
        const draft = await srv.new(HDMRelations.drafts, {
            baseObjectId,
            baseObjectType,
            businessObjectType,
            businessObjectId
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
        console.log("🚀 ~ draftEntries ~ draftEntries:", draftEntries)

        // const res = await fetch(`http://localhost:4004/odata/v4/hdm/HDMRelations?$filter=IsActiveEntity eq false and businessObjectId eq '${businessObjectId}' and businessObjectType eq '${businessObjectType}'`, {
        //     headers: {
        //         'Authorization': req.headers.authorization
        //     }
        //     });

        //     const data = await res.json();
            // const relations = data.value;
            for(let eachRelation in relationDraftEntries){
                const {baseObjectId, baseObjectType,ID} = relations[eachRelation];
                await fetch(`http://localhost:4004/odata/v4/hdm/HDMObjects(baseObjectId='${baseObjectId}',baseObjectType='${baseObjectType}',IsActiveEntity=false)/draftActivate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers.authorization 
                    }
                });

                 await fetch(`http://localhost:4004/odata/v4/hdm/HDMRelations(ID='${ID}',IsActiveEntity=false)/draftActivate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers.authorization 
                    }
                });

        }
             
    })

     srv.on("discardDocumentWithLink", async(req) => {
        const { businessObjectType, businessObjectId } = req.data;

        const res = await fetch(`http://localhost:4004/odata/v4/hdm/HDMRelations?$filter=IsActiveEntity eq false and businessObjectId eq '${businessObjectId}' and businessObjectType eq '${businessObjectType}'`, {
            headers: {
                'Authorization': req.headers.authorization
            }
            });

            const data = await res.json();
            const relations = data.value;
            for(let eachRelation in relations){
                const {baseObjectId, baseObjectType,ID} = relations[eachRelation];
                 await fetch(`http://localhost:4004/odata/v4/hdm/HDMRelations(ID='${ID}',IsActiveEntity=false)`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers.authorization 
                    }
                });

                await fetch(`http://localhost:4004/odata/v4/hdm/HDMObjects(baseObjectId='${baseObjectId}',baseObjectType='${baseObjectType}',IsActiveEntity=false)`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers.authorization 
                    }
                });
        }
             
    })
    
}
