'use strict'

import { ContextMenu } from './ContextMenu'
import { translate } from './i18n'
import { addClassName, removeClassName } from './util'

/**
 * A factory function to create an AppendNode, which depends on a Node
 * @param {Node} Node
 */
export function appendNodeFactory(Node) {
    /**
     * @constructor AppendNode
     * @extends Node
     * @param {TreeEditor} editor
     * Create a new AppendNode. This is a special node which is created at the
     * end of the list with childs for an object or array
     */
    function AppendNode(editor) {
        /** @type {TreeEditor} */
        this.editor = editor
        this.dom = {}
    }

    AppendNode.prototype = new Node()

    /**
     * Return a table row with an append button.
     * @return {Element} dom   TR element
     */
    AppendNode.prototype.getDom = function () {
        // TODO: implement a new solution for the append node
        const dom = this.dom

        if (dom.tr) {
            return dom.tr
        }

        this._updateEditability()

        // a row for the append button
        const trAppend = document.createElement('tr')
        trAppend.className = 'jsoneditor-append'
        trAppend.node = this
        dom.tr = trAppend
        // TODO: consistent naming
        if (this.editor.options.mode === 'tree') {
            // a cell for the dragarea column
            // 拖拽
            dom.tdDrag = document.createElement('td')
            dom.tr.appendChild(dom.tdDrag)

            // a cell for the contents (showing text 'empty')
            // 操作：添加
            const tdAppend = document.createElement('td')
            const domText = document.createElement('div')
            domText.className = 'jsoneditor-icon'
            domText.onclick = event => {
                event.preventDefault();
                this._onAppend('', '', 'auto')
            }
            tdAppend.appendChild(domText)
            dom.td = tdAppend
            dom.tr.appendChild(tdAppend)

            // 操作：菜单
            const tdMenu = document.createElement('td')
            dom.tr.appendChild(tdMenu)

            // 操作：占位
            const td1 = document.createElement('td')
            dom.tr.appendChild(td1)

            // 操作：占位
            const td2 = document.createElement('td')
            dom.tr.appendChild(td2)

            this.updateDom()
        }
        return trAppend
    }

    /**
     * Append node doesn't have a path
     * @returns {null}
     */
    AppendNode.prototype.getPath = () => null

    /**
     * Append node doesn't have an index
     * @returns {null}
     */
    AppendNode.prototype.getIndex = () => null

    /**
     * Update the HTML dom of the Node
     */
    AppendNode.prototype.updateDom = function (options) {
        const dom = this.dom
        const tdAppend = dom.td
        if (tdAppend) {
            tdAppend.style.paddingLeft = (this.getLevel() * 24 + 26) + 'px'
            // TODO: not so nice hard coded offset
        }

        const domText = dom.text
        if (domText) {
            domText.innerHTML = '(' + translate('empty') + ' ' + this.parent.type + ')'
        }

        // attach or detach the contents of the append node:
        // hide when the parent has childs, show when the parent has no childs
        const trAppend = dom.tr
        if (!this.isVisible()) {
            if (dom.tr.firstChild) {
                // if (dom.tdDrag) {
                //     trAppend.removeChild(dom.tdDrag)
                // }
                // if (dom.tdMenu) {
                //     trAppend.removeChild(dom.tdMenu)
                // }
                // trAppend.removeChild(tdAppend)
            }
        } else {
            if (!dom.tr.firstChild) {
                if (dom.tdDrag) {
                    trAppend.appendChild(dom.tdDrag)
                }
                if (dom.tdMenu) {
                    trAppend.appendChild(dom.tdMenu)
                }
                trAppend.appendChild(tdAppend)
            }
        }
    }

    /**
     * Check whether the AppendNode is currently visible.
     * the AppendNode is visible when its parent has no childs (i.e. is empty).
     * @return {boolean} isVisible
     */
    AppendNode.prototype.isVisible = function () {
        return (this.parent.childs.length === 0)
    }

    /**
     * Show a contextmenu for this node
     * @param {HTMLElement} anchor   The element to attach the menu to.
     * @param {function} [onClose]   Callback method called when the context menu
     *                               is being closed.
     */
    AppendNode.prototype.showContextMenu = function (anchor, onClose) {
        const node = this
        const titles = Node.TYPE_TITLES
        const appendSubmenu = [
            {
                text: translate('auto'),
                className: 'jsoneditor-type-auto',
                title: titles.auto,
                click: function () {
                    node._onAppend('', '', 'auto')
                }
            },
            {
                text: translate('array'),
                className: 'jsoneditor-type-array',
                title: titles.array,
                click: function () {
                    node._onAppend('', [])
                }
            },
            {
                text: translate('object'),
                className: 'jsoneditor-type-object',
                title: titles.object,
                click: function () {
                    node._onAppend('', {})
                }
            },
            {
                text: translate('string'),
                className: 'jsoneditor-type-string',
                title: titles.string,
                click: function () {
                    node._onAppend('', '', 'string')
                }
            }
        ]
        node.addTemplates(appendSubmenu, true)
        let items = [
            // create append button
            {
                text: translate('appendText'),
                title: translate('appendTitleAuto'),
                submenuTitle: translate('appendSubmenuTitle'),
                className: 'jsoneditor-insert',
                click: function () {
                    node._onAppend('', '', 'auto')
                },
                submenu: appendSubmenu
            }
        ]

        if (this.editor.options.onCreateMenu) {
            const path = node.parent.getPath()

            items = this.editor.options.onCreateMenu(items, {
                type: 'append',
                path: path,
                paths: [path]
            })
        }

        const menu = new ContextMenu(items, { close: onClose })
        menu.show(anchor, this.editor.frame)
    }

    /**
     * Handle an event. The event is caught centrally by the editor
     * @param {Event} event
     */
    AppendNode.prototype.onEvent = function (event) {
        const type = event.type
        const target = event.target || event.srcElement
        const dom = this.dom

        // highlight the append nodes parent
        const menu = dom.menu
        if (target === menu) {
            if (type === 'mouseover') {
                this.editor.highlighter.highlight(this.parent)
            } else if (type === 'mouseout') {
                this.editor.highlighter.unhighlight()
            }
        }

        // context menu events
        if (type === 'click' && target === dom.menu) {
            const highlighter = this.editor.highlighter
            highlighter.highlight(this.parent)
            highlighter.lock()
            addClassName(dom.menu, 'jsoneditor-selected')
            this.showContextMenu(dom.menu, () => {
                removeClassName(dom.menu, 'jsoneditor-selected')
                highlighter.unlock()
                highlighter.unhighlight()
            })
        }

        if (type === 'keydown') {
            this.onKeyDown(event)
        }
    }

    return AppendNode
}
