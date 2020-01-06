import closeImgSrc from '@/assets/map/images/mappop_t_icon.png'
const L = window.L
const DxPopup = L.Popup.extend({
    options: {
        // autoClose: true,
        className: 'dx-map-popup cpbtag_box',
        maxWidth: window.screen.width,
        offset: L.point(0, -10),
    },

    _initLayout(){
        L.Popup.prototype._initLayout.call(this);
        this._wrapper.className = 'dx-wrapper'
        this._contentNode.className = 'dx-content cbcont_cont'
        this._tipContainer.className = 'dx-tip-container cbcont_arrowdown'
        this._tip.className = 'dx-tip aarrow_icon'
        const closeContainer = this._closeContainer = L.DomUtil.create('div', 'dx-close-container cpbtag_closenav', this._container)
        const closeImg = this._closeImg = L.DomUtil.create('img', '', closeContainer)
        closeImg.src = closeImgSrc
        closeContainer.appendChild(this._closeButton)
        this._closeButton.className = 'dx-close cbcont_close'
        this._closeButton.innerHTML = ''
        L.DomEvent.on(closeContainer, 'click', L.DomEvent.stopPropagation)
    },

    _updateLayout(){
        var container = this._contentNode;
        L.Popup.prototype._updateLayout.call(this);
        container.style.width = `${container.offsetWidth-1}px`
        this._containerWidth = container.offsetWidth;
    },
});
L.dxPopup = function (options, source) {
	return new DxPopup(options, source);
};
