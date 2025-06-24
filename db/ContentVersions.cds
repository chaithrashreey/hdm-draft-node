namespace com.sap.hdm;

using {managed} from '@sap/cds/common';

entity ContentVersions : managed {
    key documentId            : String(36);
    key versionId             : String(10); //1.0, 2.0, etc.
        comments              : String(255);
        //Additional fields addded
        mimeType              : String(128);
        size                  : Decimal(12); // size in bytes
        contentStreamFileName : String(255); // Name of the content stream file, e.g. 'document.pdf'
        contentStreamURI      : String(4096); // URI to the content stream, e.g. URI of a file in a aws s3
}
