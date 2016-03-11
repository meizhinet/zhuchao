/*
 * Cntysoft Cloud Software Team
 *
 * @author Chanwang <chenyongwang1104@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 供应商信息编辑器
 */
Ext.define('App.ZhuChao.Provider.Ui.Editor', {
    extend : 'Ext.form.Panel',
    requires : [
        'App.ZhuChao.Provider.Const'
    ],
    mixins : {
        langTextProvider : 'WebOs.Mixin.RunableLangTextProvider'
    },
    /**
     * {@link WebOs.Mixin.RunableLangTextProvider#property-runableLangKey}
     *
     * @property {String} runableLangKey
     */
    runableLangKey : 'App.ZhuChao.Provider',
    //权限添加模式
    mode : 1,
    /**
     * @inheritdoc
     */
    panelType : 'Editor',
    currentNodeInfo : null,
    targetLoadId : null,
    nameFieldRef : null,
    repasswordFieldRef : null,
    constructor : function (config)
    {
        config = config || {};
        this.LANG_TEXT = this.GET_LANG_TEXT('UI.EDITOR');
        this.applyConstraintConfig(config);
        if(config.mode == ZhuChao.Const.MODIFY_MODE){
            if(!Ext.isDefined(config.targetLoadId) || !Ext.isNumber(config.targetLoadId)){
                Ext.Error.raise({
                    cls : Ext.getClassName(this),
                    method : 'constructor',
                    msg : 'mode is modify, so you must set targetLoadId id'
                });
            }
        }
        this.callParent([config]);
    },
    applyConstraintConfig : function (config)
    {
        Ext.apply(config, {
            border : true,
            bodyPadding : 10,
            layout : {
                type : 'table',
                columns : 2
            },
            autoScroll : true,
            title : this.LANG_TEXT.TITLE
        });
    },
    initComponent : function ()
    {
        Ext.apply(this, {
            defaults : {
                xtype : 'textfield',
                margin : '10 50 0 0',
                width : 700
            },
            items : this.getFormConfig(),
            buttons : [{
                    xtype : 'button',
                    text : Cntysoft.GET_LANG_TEXT('UI.BTN.SAVE'),
                    listeners : {
                        click : this.saveHandler,
                        scope : this
                    }
                }, {
                    xtype : 'button',
                    text : Cntysoft.GET_LANG_TEXT('UI.BTN.CANCEL'),
                    listeners : {
                        click : this.cancelButtonClickHandler,
                        scope : this
                    }
                }]
        });
        this.addListener('afterrender', this.afterRenderHandler, this);
        this.callParent();
    },
    loadNode : function (id)
    {
        if(this.$_current_nid_$ !== id){
            this.gotoModifyMode();
            this.setLoading(Cntysoft.GET_LANG_TEXT('MSG.LOAD'));
            this.mainPanelRef.appRef.getProviderInfo(id, this.afterLoadNodeHandler, this);
            this.$_current_nid_$ = id;
        }
    },
    afterLoadNodeHandler : function (response)
    {
        this.loadMask.hide();
        if(!response.status){
            Cntysoft.Kernel.Utils.processApiError(response);
        } else{
            this.currentNodeInfo = response.data;
            this.getForm().setValues(this.currentNodeInfo);
        }
    },
    afterRenderHandler : function ()
    {
        if(this.mode == ZhuChao.Const.MODIFY_MODE){
            this.gotoModifyMode(true);
            this.loadNode(this.targetLoadId);
        }
    },
    gotoModifyMode : function (force)
    {
        if(force || this.mode == ZhuChao.Const.NEW_MODE){
            this.add(0, this.getIdFieldConfig());
            this.mode = ZhuChao.Const.MODIFY_MODE;
        } else{
            this.nameFieldRef.setDisabled(true);
            this.repasswordFieldRef.setDisabled(true);
        }
    },
    gotoNewMode : function (force)
    {
        if(force || this.mode != ZhuChao.Const.NEW_MODE){
            if(this.mode == ZhuChao.Const.MODIFY_MODE){
                this.remove(this.items.getAt(0));
            }
            this.nameFieldRef.setDisabled(false);
            this.repasswordFieldRef.setDisabled(false);
            this.getForm().reset();
            this.currentNodeInfo = null;
            this.mode = ZhuChao.Const.NEW_MODE;
            this.$_current_nid_$ = -1;
        }
    },
    saveHandler : function ()
    {
        var C = ZhuChao.Const;
        var form = this.getForm();
        var M = this.LANG_TEXT.MSG;
        if(form.isValid()){
            if(C.NEW_MODE == this.mode){
                var values = form.getValues();
                if(Ext.isEmpty(values.password) || Ext.isEmpty(values.repassword)){
                    Cntysoft.showAlertWindow(M.NO_PASSWORD);
                    return false;
                }

                if(values.password !== values.repassword){
                    Cntysoft.showAlertWindow(M.PASSWORD_NOT_EQUAL);
                    return false;
                }
                delete values.repassword;
                this.setLoading(Cntysoft.GET_LANG_TEXT('MSG.SAVE'));
                this.mainPanelRef.appRef.createProvider(values, this.afterSaveHandler, this);
            } else if(C.MODIFY_MODE == this.mode){
                var id = this.targetLoadId;
                var values = form.getValues();
                var rawData = this.currentNodeInfo;
                Ext.each(values, function (name){
                    if(rawData[name] == values[name]){
                        delete values[name];
                    }
                }, this);
                if(!Ext.isEmpty(values)){
                    this.setLoading(Cntysoft.GET_LANG_TEXT('MSG.SAVE'));
                    this.mainPanelRef.appRef.updateProvider(id, values, this.afterSaveHandler, this);
                } else{
                    Cntysoft.showAlertWindow(M.NOT_DIRTY);
                    return false;
                }
            }
        }
    },
    cancelButtonClickHandler : function ()
    {
        this.mainPanelRef.renderPanel('ListView');
    },
    afterSaveHandler : function (response)
    {
        this.loadMask.hide();
        if(!response.status){
            Cntysoft.Kernel.Utils.processApiError(response, this.LANG_TEXT.ERROR_MAP);
        } else{
            Cntysoft.showAlertWindow(this.LANG_TEXT.MSG.SAVE_OK, function (){
                this.mainPanelRef.renderPanel('ListView');
            }, this);
        }
    },
    getFormConfig : function ()
    {
        var F = this.LANG_TEXT.FIELD;
        var M = this.LANG_TEXT.MSG;
        var d = new Date();
        return [{
                fieldLabel : F.NAME,
                allowBlank : false,
                name : 'name',
                listeners : {
                    afterrender : function (name){
                        this.nameFieldRef = name;
                    },
                    scope : this
                }
            }, {
                fieldLabel : F.PHONE,
                allowBlank : false,
                name : 'phone',
                regex : /1[3,5,7,8][0-9]{9}/,
                regexText : M.PHONE_TEXT
            }, {
                fieldLabel : F.PASSWORD,
                name : 'password',
                vtype : 'alphanum'
            }, {
                fieldLabel : F.RE_PASSWORD,
                name : 'repassword',
                vtype : 'alphanum',
                listeners : {
                    afterrender : function (field){
                        this.repasswordFieldRef = field;
                    },
                    scope : this
                }
            }, {
                xtype : 'datefield',
                fieldLabel : F.REGISTE_TIME,
                name : 'registerTime',
                maxValue : new Date(),
                format : 'Y-m-d',
                value : new Date()
            }, {
                xtype : 'datefield',
                fieldLabel : F.LAST_LOGIN_TIME,
                name : 'lastLoginTime',
                maxValue : new Date(),
                format : 'Y-m-d',
                value : new Date()
            }, {
                fieldLabel : F.REAL_NAME,
                allowBlank : true,
                name : 'realName'
            }, {
                xtype : 'radiogroup',
                columns : 3,
                fieldLabel : F.SEX,
                items : [{
                        boxLabel : F.SEX_NAME.MAN,
                        name : 'sex',
                        inputValue : 1,
                        checked : true
                    }, {
                        boxLabel : F.SEX_NAME.WOMAN,
                        name : 'sex',
                        inputValue : 2
                    }, {
                        boxLabel : F.SEX_NAME.SECRET,
                        name : 'sex',
                        inputValue : 3
                    }]
            }, {
                fieldLabel : F.DEPARTMENT,
                name : 'department'
            }, {
                fieldLabel : F.POSITION,
                name : 'position'
            }, {
                fieldLabel : F.EMAIL,
                name : 'email'
            }, {
                fieldLabel : F.SHOW_PHONE,
                name : 'showPhone'
            }, {
                fieldLabel : F.QQ,
                name : 'qq'
            }, {
                fieldLabel : F.TEL,
                name : 'tel'
            }, {
                fieldLabel : F.FAX,
                name : 'fax'
            }, {
                xtype : 'radiogroup',
                columns : 2,
                fieldLabel : F.STATUS,
                items : [{
                        boxLabel : F.STATUS_NAME.NORMAL,
                        name : 'status',
                        inputValue : 1,
                        checked : true
                    }, {
                        boxLabel : F.STATUS_NAME.LOCK,
                        name : 'status',
                        inputValue : 2
                    }]
            }];
    },
    getIdFieldConfig : function ()
    {
        return {
            xtype : 'displayfield',
            fieldLabel : this.LANG_TEXT.FIELD.ID,
            name : 'id'
        };
    },
    destroy : function ()
    {
        delete this.currentNodeInfo;
        delete this.nameFieldRef;
        delete this.targetLoadId;
        delete this.repasswordFieldRef;
        this.callParent();
    }
});
