class ItemParams {

  constructor(item, keys) {
    this.item = item;
    this.keys = keys;
  }

  paramsForExportFile() {
    this.additionalFields = ["updated_at"];
    this.forExportFile = true;
    return _.omit(this.__params(), ["deleted"]);
  }

  paramsForExtension() {
    return this.paramsForExportFile();
  }

  paramsForLocalStorage() {
    this.additionalFields = ["updated_at", "dirty"];
    this.forExportFile = true;
    return this.__params();
  }

  paramsForSync() {
    return this.__params(null, false);
  }

  __params() {
    let encryptionVersion = "001";
    
    var itemCopy = _.cloneDeep(this.item);

    console.assert(!this.item.dummy, "Item is dummy, should not have gotten here.", this.item.dummy)

    var params = {uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at};

    if(this.keys) {
      EncryptionHelper.encryptItem(itemCopy, this.keys, encryptionVersion);
      params.content = itemCopy.content;
      params.enc_item_key = itemCopy.enc_item_key;
      if(encryptionVersion === "001") {
        params.auth_hash = itemCopy.auth_hash;
      } else {
        params.auth_hash = null;
      }
    }
    else {
      params.content = this.forExportFile ? itemCopy.createContentJSONFromProperties() : "000" + Neeto.crypto.base64(JSON.stringify(itemCopy.createContentJSONFromProperties()));
      if(!this.forExportFile) {
        params.enc_item_key = null;
        params.auth_hash = null;
      }
    }

    if(this.additionalFields) {
      _.merge(params, _.pick(this.item, this.additionalFields));
    }

    return params;
  }


}
