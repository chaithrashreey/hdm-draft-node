namespace com.sap.hdm;

using {managed} from '@sap/cds/common';
using {com.sap.hdm.BaseObjectType} from './type/BaseObjectType';
using {com.sap.hdm.VersionAction} from './type/VersionAction';


entity ContentVersions : managed {
    key baseObjectType    : String(100);
    key baseObjectKey     : BaseObjectType;
    key versionId         : String(10);
        action            : VersionAction;
        actionDescription : String(100);
        comments          : String(255);
}
