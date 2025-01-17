/**
 * Copyright 2019 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';

import {MdEdit as IconEdit} from 'react-icons/md';
import {MdFunctions as IconFunction} from 'react-icons/md';

import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import I18n from '@iobroker/adapter-react/i18n';
import Utils from '@iobroker/adapter-react/Components/Utils';

const styles = theme => ({
    header: {
        width: '100%',
        fontSize: 16,
        textTransform: 'capitalize',
        textAlign: 'center',
        paddingBottom: 20,
        color: '#000',
    },
    divOidField: {
        width: '100%',
        borderTop: '1px dashed #cacaca',
        display: 'block',
        paddingTop: 5,
        paddingBottom: 5,
        height: 69,
    },
    oidName: {
        width: 100,
        display: 'inline-block',
    },
    oidField: {
        display: 'inline-block',
        marginTop: 0,
        marginBottom: 0,
        width: 'calc(100% - 185px)',
    },
    colorButton: {
        '&>div': {
            width: '100%'
        }
    },
    divOids: {
        display: 'inline-block',
        width: 'calc(50% - 55px)',
        verticalAlign: 'top',
    },
    divDevice: {
        display: 'inline-block',
        width: 100,
        verticalAlign: 'top',
    },
    divIndicators: {
        display: 'inline-block',
        width: 'calc(50% - 55px)',
        verticalAlign: 'top',
    },
    divDialogContent: {
        fontSize: '1rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    buttonPen: {
        color: '#ffffff',
    },
    headerButtons: {
        textAlign: 'right'
    },
    enumIcon: {
        width: 24,
        height: 24
    },
    funcDivEdit: {
        width: '100%'
    },
    funcEditName: {
        display: 'inline-block',
        width: 85
    },
    funcEdit: {
        display: 'inline-block',
        marginTop: 0,
        marginBottom: 0,
        width: 'calc(100% - 85px)',
    },
});

class DialogEditDevice extends React.Component {
    constructor(props) {
        super(props);
        const ids = {};
        this.fx = {};

        this.props.channelInfo.states.forEach(state => {
            if (state.id) {
                const obj = this.props.objects[state.id];
                if (obj && obj.common && obj.common.alias) {
                    ids[state.name] = obj.common.alias.id || '';
                    this.fx[state.name] = {
                        read:  obj.common.alias.read  || '',
                        write: obj.common.alias.write || '',
                    };
                } else {
                    this.fx[state.name] = {read: '', write: ''};
                }

                if (state.defaultRole && state.defaultRole.startsWith('button')) {
                    delete this.fx[state.name].read;
                }
                if (!state.write ||
                    (state.defaultRole && (state.defaultRole.startsWith('indicator') || state.defaultRole.startsWith('value')))
                ) {
                    delete this.fx[state.name].write;
                }
            } else {
                this.fx[state.name] = {read: '', write: ''};
            }
        });

        this.channelId = this.props.channelInfo.channelId;
        let name = '';
        const channelObj = this.props.objects[this.channelId];

        if (channelObj && channelObj.common) {
            name = Utils.getObjectNameFromObj(channelObj, null, {language: I18n.getLanguage()});
        }

        this.state = {
            ids,
            name,
            selectIdFor: '',
            editFxFor: '',
        };

        this.pattern = this.props.patterns[Object.keys(this.props.patterns)
            .find(type => this.props.patterns[type].type === this.props.channelInfo.type)];
    }

    renderSelectDialog() {
        if (!this.state.selectIdFor) {
            return null;
        }
        return (<DialogSelectID
            connection={this.props.socket}
            title={I18n.t('Select for ') + this.state.selectIdFor}
            selected={this.state.ids[this.state.selectIdFor] || this.findRealDevice()}
            statesOnly={true}
            onOk={id => {
                const ids = JSON.parse(JSON.stringify(this.state.ids));
                ids[this.state.selectIdFor] = id;
                this.setState({selectIdFor: '', ids})
            }}
            onClose={() => this.setState({selectIdFor: ''})}
        />);
    }

    handleClose() {
        this.props.onClose && this.props.onClose();
    }

    handleOk() {
        this.props.onClose && this.props.onClose({
            ids:  this.state.ids,
            fx: this.fx,
        });
    };

    renderHeader() {
        const classes = this.props.classes;
        return (<div className={classes.header}>
            <div className={classes.divOids + ' ' + classes.headerButtons}/>
            <div className={classes.divDevice}>{this.props.channelInfo.type}</div>
            <div className={classes.divIndicators}/>
        </div>);
    }

    findRealDevice() {
        let realParent = Object.keys(this.state.ids).find(id => this.state.ids[id]);
        if (realParent) {
            realParent = this.state.ids[realParent];
            const parts = realParent.split('.');
            parts.pop();
            realParent = parts.join('.');
        }
        return realParent || '';
    }

    renderSelectEnum(name) {
        const enums = this.props.enumIDs.filter(id => id.startsWith('enum.' + name + '.'));
        const language = I18n.getLanguage();
        const objs = enums.map(id => {
            return {
                name: Utils.getObjectName(this.props.objects, id, {language}),
                icon: Utils.getObjectIcon(id, this.props.objects[id]),
                id: id
            }
        });

        return (<Select
            className={this.props.classes.oidField}
            value={this.state[name]}
            multiple={true}
            onChange={e => {
                this.setState({[name]: e.target.value})
            }}
            >
            {objs.map(obj => (<MenuItem key={obj.id} icon={obj.icon} value={obj.id}>
                    {/*obj.icon ? (<img className={this.props.classes.enumIcon} src={obj.icon} alt={obj.id}/>) : (<div className={this.props.classes.enumIcon}/>)*/}
                    {obj.name}
                </MenuItem>))}
        </Select>);
    }

    renderEditFxDialog() {
        if (!this.state.editFxFor) {
            return null;
        }
        const fx = this.fx[this.state.editFxFor];

        this.fxRead = fx.read;
        this.fxWrite = fx.write;

        return (<Dialog
            open={true}
            maxWidth="sm"
            onClose={() => this.handleOk()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle className={this.props.classes.titleBackground}
                         classes={{root: this.props.classes.titleColor}}
                         id="edit-device-dialog-title">{I18n.t('Edit read/write functions')} <b>{this.state.editFxFor}</b></DialogTitle>
            <DialogContent>
                <div className={this.props.classes.divDialogContent}>
                    {fx.read !== undefined ? (<div className={this.props.classes.funcDivEdit}>
                        <div className={this.props.classes.funcEditName} style={{fontWeight: 'bold'}}>{I18n.t('Read')}</div>
                        <TextField
                            fullWidth
                            defaultValue={this.fxRead}
                            className={this.props.classes.funcEdit}
                            onChange={e => this.fxRead = e.target.value}
                            helperText={I18n.t('JS function like') + ' "val / 5 + 21"'}
                            margin="normal"
                        />
                    </div>) : null}
                    {fx.write !== undefined ? (<div className={this.props.classes.funcDivEdit}>
                        <div className={this.props.classes.funcEditName} style={{fontWeight: 'bold'}}>{I18n.t('Write')}</div>
                        <TextField
                            fullWidth
                            defaultValue={this.fxWrite}
                            helperText={I18n.t('JS function like') + ' "(val - 21) * 5"'}
                            className={this.props.classes.funcEdit}
                            onChange={e => this.fxWrite = e.target.value}
                            margin="normal"
                        />
                    </div>) : null}
                </div>
            </DialogContent>
            <DialogActions>
                <Button href="" onClick={() => {
                    this.setState({editFxFor: ''});
                    if (this.fx[this.state.editFxFor].read !== undefined) {
                        this.fx[this.state.editFxFor].read = this.fxRead;
                    }
                    if (this.fx[this.state.editFxFor].write !== undefined) {
                        this.fx[this.state.editFxFor].write = this.fxWrite;
                    }
                }} color="primary" autoFocus>{I18n.t('Ok')}</Button>
                <Button href="" onClick={() => this.setState({editFxFor: ''})}>{I18n.t('Cancel')}</Button>
            </DialogActions>
        </Dialog>);
    }

    renderVariable(item) {
        if (!item.id && !this.channelId.startsWith('alias.') && !this.channelId.startsWith('linkeddevices.')) {
            return null;
        }
        let props = [item.type || 'any'];
        const dName = item.name.replace(/\d+$/, '%d');
        let pattern = this.pattern.states.find(state => state.name === item.name || state.name === dName);
        if (item.write) props.push('write');
        if (item.read) props.push('read');
		if (pattern.defaultRole) {
			props.push('role=' + pattern.defaultRole);
		} else {
			if (pattern.role) props.push('role=' + pattern.role.toString());
		}

        if (pattern.enums) {
            const type = this.props.channelInfo.type;
            if (type === 'dimmer' || type === 'light') {
                props.push('enum light');
            } else if (type === 'blinds' || type === 'window' || type === 'windowTilt') {
                props.push('enum window');
            } else if (type === 'door') {
                props.push('enum door');
            } else {
                props.push('enum ' + this.props.channelInfo.type);
            }
        }
        const alias = this.channelId.startsWith('alias.');
        const name = item.name;

        return (
            <div className={this.props.classes.divOidField} style={!item.id && !this.state.ids[name] ? {opacity: 0.6} : {}}>
                <div className={this.props.classes.oidName} style={item.required ? {fontWeight: 'bold'} : {}}>{(item.required ? '*' : '') + name}</div>
                <TextField
                    key={name}
                    fullWidth
                    disabled={!alias}
                    label={item.id || (this.channelId + '.' + name)}
                    value={alias ? this.state.ids[name] || '' : item.id || ''}
                    className={this.props.classes.oidField}
                    onChange={e => {
                        const ids = JSON.parse(JSON.stringify(this.state.ids));
                        ids[name] = e.target.value;
                        this.setState({ids});
                    }}
                    helperText={props.join(', ')}
                    margin="normal"
                />
                {alias ? (<Fab href="" size="small" color="secondary" onClick={() => {this.setState({selectIdFor: name})}} className={this.props.classes.buttonPen}><IconEdit /></Fab>) : null}
                {alias && this.state.ids[name] ? (<Fab href="" color={this.fx[name] && (this.fx[name].read || this.fx[name].write) ? 'primary' : ''} style={{marginLeft: 5}} size="small" onClick={() => {this.setState({editFxFor: name})}} className={this.props.classes.buttonPen}><IconFunction /></Fab>) : null}
            </div>);
    }

    renderVariables() {
        return (<div className={this.props.classes.divOids}>
            {this.props.channelInfo.states.filter(item => !item.indicator).map(item => this.renderVariable(item))}
        </div>);
    }

    renderIndicators() {
        return (<div className={this.props.classes.divIndicators}>{
            this.props.channelInfo.states.filter(item => item.indicator).map(item => this.renderVariable(item))
        }</div>);
    }

    renderContent() {
        return [
            this.renderVariables(),
            (<div className={this.props.classes.divDevice}/>),
            this.renderIndicators()
        ];
    }

    render() {
        return [(<Dialog
                open={true}
                maxWidth="l"
                fullWidth={true}
                onClose={() => this.handleOk()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle className={this.props.classes.titleBackground}
                             classes={{root: this.props.classes.titleColor}}
                             id="edit-device-dialog-title">{I18n.t('Edit device')} <b>{this.channelId}</b></DialogTitle>
                <DialogContent>
                    <div className={this.props.classes.divDialogContent}>
                        {this.renderHeader()}
                        {this.renderContent()}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button href="" onClick={() => this.handleOk()} color="primary" autoFocus>{I18n.t('Ok')}</Button>
                    <Button href="" onClick={() => this.handleClose()}>{I18n.t('Cancel')}</Button>
                </DialogActions>
            </Dialog>),
            this.renderSelectDialog(),
            this.renderEditFxDialog()
        ];
    }
}

DialogEditDevice.propTypes = {
    onClose: PropTypes.func,
    patterns: PropTypes.object,
    channelInfo: PropTypes.object,
    objects: PropTypes.object,
    enumIDs: PropTypes.object,
    states: PropTypes.object,
    socket: PropTypes.object
};

export default withStyles(styles)(DialogEditDevice);
