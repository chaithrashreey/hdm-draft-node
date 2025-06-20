namespace com.sap.hdm;

using {cuid, managed} from '@sap/cds/common';
using {com.sap.hdm.HDMObjects} from './HDMObjects';
using {com.sap.hdm.ObjectRelationStatus} from './type/ObjectRelationStatus';
using {com.sap.hdm.BaseObjectType} from './type/BaseObjectType';


@odata.draft.enabled
entity HDMRelations :cuid, managed {
     businessObjectType : String(30);//Slares Order, purchase Order, etc.
     businessObjectId   : String(90);//Sales OrderID, Purchase Order ID, etc.
     baseObjectType     : BaseObjectType;//F,D
     baseObjectId       : UUID;//document ID
        status             : ObjectRelationStatus;
        // Association to HDMObjects
        hdmObject         : Association to HDMObjects
                                 on  hdmObject.baseObjectType = baseObjectType
                                 and hdmObject.baseObjectId   = baseObjectId @assert.integrity;
      isRelationLocked:   Boolean;
      isUnlinked:  Boolean;                           
}
/*
Leading Application:
so123
so456

HDMRelations:
Sales Order, so123, D, Doc1
Sales Order, so123, D, Doc2

Purchase Order, po123, D, Doc1

HDMObjects:
D, Doc1
D, Doc2


*/