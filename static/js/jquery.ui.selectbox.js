/*
 * jQuery UI Selectbox
 *
 * Author: sergiy.smolyak@gmail.com
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js
 *    jquery.ui.autocomplete.js
 *    jquery.ui.button.js
 */
(function( $, undefined ) {

    $.widget( "ui.selectbox", {
        options: {
            appendTo: "body",
            height: 1.4, // default control height (em)
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            }
        },
        _create: function() {
            var self = this;
            var select = this.element.hide();
            var input = this.input = $( "<input/>" )
                .insertAfter(select)
                .addClass( "ui-autocomplete-input ui-widget ui-widget-content ui-corner-left" )
                .attr({
                    readonly: true,
                    autocomplete: "off",
                    role: "textbox",
                    "aria-selectbox": "list",
                    "aria-haspopup": "true"
                })
                .css({
                    height: "" + this.options.height + "em",
                    lineHeight: "" + this.options.height + "em"
                })
                .bind( "keydown.selectbox", function( event ) {
                    if ( self.options.disabled ) {
                        return;
                    }
    
                    var keyCode = $.ui.keyCode;
                    switch( event.keyCode ) {
                    case keyCode.PAGE_UP:
                        self._move( "previousPage", event );
                        break;
                    case keyCode.PAGE_DOWN:
                        self._move( "nextPage", event );
                        break;
                    case keyCode.UP:
                        self._move( "previous", event );
                        // prevent moving cursor to beginning of text field in some browsers
                        event.preventDefault();
                        break;
                    case keyCode.DOWN:
                        self._move( "next", event );
                        // prevent moving cursor to end of text field in some browsers
                        event.preventDefault();
                        break;
                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                        // when menu is open or has focus
                        if ( self.menu.element.is( ":visible" ) ) {
                            event.preventDefault();
                        }
                        //passthrough - ENTER and TAB both select the current element
                    case keyCode.TAB:
                        if ( !self.menu.active ) {
                            return;
                        }
                        self.menu.select( event );
                        break;
                    case keyCode.ESCAPE:
                        self.close( event );
                        break;
                    default:
                        // keypress is triggered before the input value is changed
                        break;
                    }
                })
                .bind( "focus.selectbox", function( event ) {
                    if ( self.options.disabled ) {
                        return;
                    }
                    self.selectedItem = null;
                    self.previous = self.element.val();
                    input
                        .addClass( "ui-corner-tl" )
                        .removeClass( "ui-corner-left" );
                    button
                        .addClass( "ui-state-focus ui-corner-tr" )
                        .removeClass( "ui-corner-right" );
                    self.open( event );
                })
                .bind( "blur.selectbox", function( event ) {
                    if ( self.options.disabled ) {
                        return;
                    }
                    button.removeClass( "ui-state-focus" );
                    input
                        .addClass( "ui-corner-left" )
                        .removeClass( "ui-corner-tl" );
                    button
                        .addClass( "ui-corner-right" )
                        .removeClass( "ui-state-focus ui-corner-tr" );
                    // clicks on the menu (or a button) will cause a blur event
                    self.closing = setTimeout(function() {
                        self.close( event );
                        self._change( event );
                    }, 150 );
                });
            var button = this.button = $( "<button>&nbsp;</button>" )
                .insertAfter(input)
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                }).removeClass( "ui-corner-all" )
                .addClass( "ui-corner-right ui-button-icon" )
                .height( input.outerHeight() )
                .children( ".ui-button-text" )
                    .css({
                        height: "" + this.options.height + "em",
                        lineHeight: "" + this.options.height + "em"
                    })
                    .parent()
                .css({ overflow: "hidden" })
                .position({
                    my: "left center",
                    at: "right center",
                    of: input,
                    offset: "-1 0"
                })//.css("top", "")
                .click(function( event ) {
                    // close if already visible
                    if (self.menu.element.is( ":visible" )) {
                        self.close( event );
                    } else {
                        // pass focus to input element to open menu
                        input.focus();
                    }
                    // prevent submit
                    return false;
                });
            this.refresh();
        },
        refresh: function() {
            var self = this;
            var doc = this.element[ 0 ].ownerDocument;
            if (this.menu !== undefined) {
                this.menu.element.remove();
            } 
            this.menu = $( "<ul></ul>" )
                .css({ opacity: 0 }) // hide element but allow to render
                .appendTo( $( this.options.appendTo || "body", doc )[0] )
                // prevent the close-on-blur in case of a "slow" click on the menu (long mousedown)
                .mousedown(function( event ) {
                    // clicking on the scrollbar causes focus to shift to the body
                    // but we can't detect a mouseup or a click immediately afterward
                    // so we have to track the next mousedown and close the menu if
                    // the user clicks somewhere outside of the selectbox
                    var menuElement = self.menu.element[ 0 ];
                    if ( event.target === menuElement ) {
                        setTimeout(function() {
                            $( document ).one( "mousedown", function( event ) {
                                if ( event.target !== self.element[ 0 ] &&
                                    event.target !== menuElement &&
                                    !$.ui.contains( menuElement, event.target ) ) {
                                    self.close();
                                }
                            });
                        }, 1 );
                    }
                    // use another timeout to make sure the blur-event-handler on the input was already triggered
                    setTimeout(function() {
                        clearTimeout( self.closing );
                    }, 13);
                })
                .menu({
                    focus: function( event, ui ) {
                        var item = ui.item.data( "item.selectbox" );
                        if ( false !== self._trigger( "focus", null, { item: item } ) ) {
                            // use value to match what will end up in the input, if it was a key event
                            if ( /^key/.test(event.originalEvent.type) ) {
                                self.element.val( item.value );
                            }
                        }
                    },
                    selected: function( event, ui ) {
                        var item = ui.item.data( "item.selectbox" ),
                            previous = self.previous;
    
                        // only trigger when focus was lost (click on menu)
                        if ( self.element[0] !== doc.activeElement ) {
                            self.element.focus();
                            self.previous = previous;
                        }
    
                        if ( false !== self._trigger( "select", event, { item: item } ) ) {
                            self.input.val( item.innerHTML );
                            self.element.val( item.value ).change();
                        }
    
                        self.close( event );
                        self.selectedItem = item;
                    },
                    blur: function( event, ui ) {
                    }
                })
                .removeClass( "ui-corner-all" )
                .addClass( "ui-corner-bottom ui-autocomplete" )
                .zIndex( this.element.zIndex() + 1 )
                // workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
                .css({ top: 0, left: 0 })
                .data( "menu" );
            this._renderMenu( this.element.get(0).options );
            this.menu.element
                .outerWidth( Math.max(
                    this.menu.element.width( "" ).outerWidth(), // Menu Width
                    this.input.outerWidth() + this.button.outerWidth() - 1 // Control Width
                ))
                .position( $.extend( { of: this.input }, this.options.position ))
                .hide()
                .css({ opacity: 1 }); // remove transparency
            if ( $.fn.bgiframe ) {
                 this.menu.element.bgiframe();
            }
        },
    
        destroy: function() {
            this.input.remove();
            this.button.remove();
            this.element
                .removeClass( "ui-autocomplete-input ui-widget ui-widget-content ui-corner-left" )
                .removeAttr( "autocomplete" )
                .removeAttr( "readonly" )
                .removeAttr( "role" )
                .removeAttr( "aria-selectbox" )
                .removeAttr( "aria-haspopup" )
                .show();
            this.menu.element.remove();
            $.Widget.prototype.destroy.call( this );
        },
    
        _setOption: function( key, value ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "source" ) {
                this._initSource();
            }
            if ( key === "appendTo" ) {
                this.menu.element.appendTo( $( value || "body", this.element[0].ownerDocument )[0] )
            }
        },
    
        open: function( event ) {
            clearTimeout( this.closing );
            if ( !this.menu.element.is( ":visible" ) ) {
                this._trigger( "open", event );
                this.menu.deactivate();
                this.menu.refresh();
                this.menu.element.show()
            }
        },
    
        close: function( event ) {
            clearTimeout( this.closing );
            if ( this.menu.element.is( ":visible" ) ) {
                this._trigger( "close", event );
                this.menu.element.hide();
                this.menu.deactivate();
                this.input.blur();
            }
        },
        
        _change: function( event ) {
            if ( this.previous !== this.element.val() ) {
                this._trigger( "change", event, { item: this.selectedItem } );
            }
        },
    
        _renderMenu: function( items ) {
            var ul = this.menu.element
                    .empty()
                    .zIndex( this.element.zIndex() + 1 ),
                menuWidth,
                textWidth;
            var self = this;
            $.each( items, function( index, item ) {
                if (item.selected) {
                    self.input.val(item.innerHTML);
                }
                self._renderItem( ul, item );
            });
            this.menu.deactivate();
            this.menu.refresh();
        },
    
        _renderItem: function( ul, item) {
            return $( "<li></li>" )
                .data( "item.selectbox", item )
                .append( $( "<a></a>" ).text( item.innerHTML ) ) // or item.label or item.text
                .appendTo( ul );
        },
    
        _move: function( direction, event ) {
            if ( !this.menu.element.is(":visible") ) {
                this.search( null, event );
                return;
            }
            if ( this.menu.first() && /^previous/.test(direction) ||
                    this.menu.last() && /^next/.test(direction) ) {
                this.menu.deactivate();
                return;
            }
            this.menu[ direction ]( event );
        },
    
        widget: function() {
            return this.menu.element;
        }
    });
    
}( jQuery ));


