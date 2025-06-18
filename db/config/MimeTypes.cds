namespace com.sap.hdm;

entity MimeTypes {
    type     : String(10); // allow/block
    extensions: array of String(10); // e.g. ['pdf', 'docx', 'txt']
}
