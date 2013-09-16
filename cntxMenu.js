var wTmplt 
  = '<div id="{{name}}CntxMenu" class="cntxMenu {{subclass}}" style="display:none"> '
  + '  <ul id="{{name}}CntxMenuUL" class="contextMenu"> '
  + '  </ul> '
  + '</div>'
  ;

var bTmplt 
  = '<li id="{{name}}CntxButton"> '
  + '  <div class="ct_left"></div> '
  + '  <div class="ct_middle"> '
  + '    <div class="menuItem {{name}}CntxBtn" style="background-image:url({{img}})"> '
  + '      {{text}} '
  + '    </div> '
  + '  </div> '
  + '  <div class="ct_right"></div> '
  + '  <div style="clear:both;"></div> '
  + '</li>'
  ;

if(typeof String.prototype.fillWith !== 'function')
Object.defineProperty(
  String.prototype, 
  "fillWith", 
  { value: function(obj){
      return this.replace(/\{\{(\w+)\}\}/g, function(match,v){return obj[v]});
    },
    enumerable : false
  }
);

if(typeof Object.prototype.toList !== 'function')
Object.defineProperty(
  Object.prototype, 
  "toList", 
  { value: function(){
    return Object.getOwnPropertyNames(this).map(function(v){
        return this[v];
      }, this);
    },
    enumerable : false
  }
);

function cntxMenu(name, bind, subclass){
  if ( !(this instanceof cntxMenu) ){
    return new (Function.prototype.bind.apply(
    cntxMenu
    , ([this].concat(Array.prototype.slice.call(arguments))) ));
  }
  this.name = name;
  this.bind = bind;
  this.subclass = subclass || "";
  this.buttons = {};
  this.element;
  
  this.enabled = true;
  
  this.enable = function(v){
    this.enabled = typeof v === 'boolean' ? v : true;
  };
  
  this.disable = function(v){
    this.enabled = typeof v === 'boolean' ? !v : false;
  };
  
  var lastEvent;

  this.genHtml = function(){
    return wTmplt.fillWith(this);
  };

  this.getHtml = function(){
    return this.element;
  };
  
  this.setup = function(){
    this.element = ($(this.genHtml()).appendTo('body'));

    $('body').on('contextmenu', this.bind, function(e) {
      if(!this.enabled)return true;
      this.lastEvent = e;
      $('.cntxMenu').hide();
      
      // Check Screen Limits
      if($('#'+this.name+'CntxMenu').width() + e.pageX <= window.innerWidth){
        $('#'+this.name+'CntxMenu')
          .css('right', 'auto')
          .css('left', e.pageX);
      }else{
        $('#'+this.name+'CntxMenu')
          .css('left', 'auto')
          .css('right', window.innerWidth - e.pageX);
      }      
      
      if($('#'+this.name+'CntxMenu').height() + e.pageY <= window.innerHeight){
        $('#'+this.name+'CntxMenu')
          .css('bottom', 'auto')
          .css('top', e.pageY);
      }else{
        $('#'+this.name+'CntxMenu')
          .css('top', 'auto')
          .css('bottom', window.innerHeight - e.pageY);
      }
      
      
      $('#'+this.name+'CntxMenu').show();
      return false;
    }.bind(this));    

    $(window).blur(function(){
      $('#'+this.name+'CntxMenu').hide();
    }.bind(this));

    $(document).click(function() {
      $('#'+this.name+'CntxMenu').hide();
    }.bind(this));

    $('#'+this.name+'CntxMenu').click(function(event) {
      event.stopPropagation();
    }.bind(this));

    $(document).on('contextmenu', function() {
      $('#'+this.name+'CntxMenu').hide();
    }.bind(this));

    $('#'+this.name+'CntxMenu').on('contextmenu', function(event) {
      event.stopPropagation();
    }.bind(this));

    $(this.bind).on('click', function(event) {
      $('#'+this.name+'CntxMenu').hide();
    }.bind(this));    
  };

  this.addButton = function(btn){
    this.buttons[btn.name] = btn;
    return ($(btn.genHtml()).appendTo('#'+this.name+'CntxMenuUL'));
  };

  this.getId = function(){
      return this.name+'CntxMenu';
  };

  this.getLastEvent = function(){      
    return this.lastEvent;
  };
  
  this.checkButtons = function(){
    if( !(this.buttons.toList().some(function(v){return v.enabled})) ){
      this.disable();
    }else{
      this.enable();
    }
  }
  
  this.add = function(button){
    button.setup(this);
    
    return this;
  };
  this.setup();
}

function cntxMenuButton(name, value, text, img, func){
  if ( !(this instanceof cntxMenuButton) ){
    return new (Function.prototype.bind.apply(
    cntxMenuButton
    , ([this].concat(Array.prototype.slice.call(arguments))) ));
  }
  this.name = name;
  this.value = value;
  this.text = text;
  this.img  =  img;
  this.func = func;
  this.enabled = true;
  this.menu;
  this.element;

  
  this.getHtml = function(){
    return this.element;
  };
  
  this.genHtml = function(){
    return bTmplt.fillWith(this);
  };

  this.getId = function(){
      return this.name+'CntxButton';
  };

  this.setup = function(m){
    this.menu = m;
    this.element = this.menu.addButton(this);

    $('#'+this.name+'CntxButton').on('click', $.proxy(function(e){
      $('#'+this.menu.name+'CntxMenu').hide();
      this.func(this.menu.getLastEvent(),e, this.value, this);
    }, this));
  };
  
  this.enable = function(v){
    if(this.enabled = (typeof v === 'boolean' ? v : true)){
      $(this.element).show();
    }else{
      $(this.element).hide();
    }
    this.menu.checkButtons();
  };
  this.disable = function(v){
    if(this.enabled = (typeof v === 'boolean' ? !v : false)){
      $(this.element).show();
    }else{
      $(this.element).hide();
    }
    this.menu.checkButtons();
  };  
  this.setPos = function(p){
    $(this.element).detach();
    if(p >= Object.keys(this.menu.buttons).length){
      p = Object.keys(this.menu.buttons).length-1;
    }
    if(p < 0){
      p = Object.keys(this.menu.buttons).length+p;
    }
    if(p === 0){
      $(this.menu.getHtml()).find('li:eq(0)').before(this.element);
    }else{
      $(this.menu.getHtml()).find('li:eq('+(p-1)+')').after(this.element);
    }
  };
}
            
            