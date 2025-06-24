const cds = require('@sap/cds');

module.exports = (srv) => {
    const { Documents, Relations } = srv.entities;
    srv.on("createDocumentsWithLinks", async (req) => {
            const { documentsWithLinks } = req.data;
            let relationsDraftIds = [];
            for (let i in documentsWithLinks) {
                const eachDocWithLink = documentsWithLinks[i];
                const {businessObjectTypeId, businessObjectId } = eachDocWithLink;
                try {
                    delete eachDocWithLink.businessObjectId;
                    delete eachDocWithLink.businessObjectTypeId;

                    let relationDraft = {};
                    await cds.tx(req).run(async (tx) => {
                        const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                        const srv = hdmService.tx(tx); // bind service to transaction

                        const docDraftCreated = await srv.new(Documents.drafts, {
                            ...eachDocWithLink
                        });
                        const {ID: documentId} = docDraftCreated;

                        relationDraft = await srv.new(Relations.drafts, {
                            documentId,
                            businessObjectTypeId,
                            businessObjectId
                        });

                        const { ID: relationId } = relationDraft;
                        relationsDraftIds.push(relationId)
                    });
                }catch(err) {
                    req.error(500, "Failed to create linked drafts.");    
                }    
            }

            const relationsWIthDocuments = await srv.run(SELECT.from('RelationsWithDocuments').where({ ID: { in: relationsDraftIds } }))

            return relationsWIthDocuments;
        });
}    