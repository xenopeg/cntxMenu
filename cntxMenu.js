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
    return new (
      Function.prototype.bind.apply(
        cntxMenu
        , ([this].concat(Array.prototype.slice.call(arguments))) 
      )
    );
  }
  var name
    , bind
    , subclass
    , buttons = {}
    , node
    , ULnode
    , enabled = true
    ;
  if(typeof name === 'object'){
    bind = name.bind
    , subclass = name.subclass || ""
    , name = name.name
      ;
  }else{
    name = name
    , bind = bind
    , subclass = subclass || ""
      ;  
  }
  
  function enable(v){
    enabled = typeof v === 'boolean' ? v : true;
  };this.enable = enable;
  
  function disable(v){
    enabled = typeof v === 'boolean' ? !v : false;
  };this.disable = disable;
  
  var lastEvent;

  function genHtml(){
    return wTmplt.fillWith({
      name: name,
      subclass: subclass
    });
  };this.genHtml = genHtml;

  function getNode(){
    return node;
  };this.getNode = getNode;
  
  function setup(){
    node = $(genHtml()).appendTo('body');
    ULnode = node.children('ul');

    $('body').on('contextmenu', bind, onCntxMenu);    

    $(window).on('blur', onBlur);
    $(document).on('click', onLoseFocus);
    node.on('click', onInsideClick);
    $(document).on('contextmenu', onOtherMenu);
    node.on('contextmenu', onYoDawgMenu);
    $(bind).on('click', onBindClick);    
  };
  
  function onBindClick(event) {
    node.hide();
  }
  function onYoDawgMenu(event) {
    event.stopPropagation();
  }
  function onOtherMenu(){
    node.hide();
  }
  function onInsideClick(event) {
    event.stopPropagation();
  }
  function onLoseFocus() {
    node.hide();
  }
  function onBlur(){
    node.hide();
  }
  function onCntxMenu(e) {
    if(!enabled)return true;
    
    lastEvent = e;
    
    // Hide other context menus
    $('.cntxMenu').hide();
    
    // Check Screen Limits
    if( node.width() + e.pageX <= window.innerWidth ){      
      node.css({
        'left': e.pageX,
        'right': 'auto'
      });
    }else{
      node.css({
        'left': 'auto',
        'right': window.innerWidth - e.pageX
      });
    }      
    
    if(node.height() + e.pageY <= window.innerHeight){
      node.css({
        'bottom': 'auto',
        'top': e.pageY
      });
    }else{
      node.css({
        'bottom': window.innerHeight - e.pageY,
        'top': 'auto'
      });
    }
    
    node.show();
    return false;
  }

  function addButton(btn){
    buttons[btn.getName()] = btn;
    ULnode.append(btn.getNode());
  };this.addButton = addButton;

  function getId(){
      return name+'CntxMenu';
  };this.getId = getId;

  function getLastEvent(){      
    return lastEvent;
  };this.getLastEvent = getLastEvent;
  
  function checkButtons(){
    var anyVisible = buttons.toList()
        .some(function(v){return v.isEnabled();});
        
    if( anyVisible ){
      enable();
    }else{
      disable();
    }
    
  };this.checkButtons = checkButtons;
  
  function add(button){
    button.setup(this);
    delete button.setup;
    return this;
  };this.add = add;
  
  function remove(){    
    buttons.toList().forEach(function(v){
      v.remove();
    });
    $(bind).off('click', onBindClick);    
    node.off('contextmenu', onYoDawgMenu);
    $(document).off('contextmenu', onOtherMenu);
    node.off('click', onInsideClick);
    $(document).off('click', onLoseFocus);
    $(window).off('blur', onBlur);
    $('body').off('contextmenu', bind, onCntxMenu);  
    
  };this.remove = remove;
  
  function removeMe(btn){
    delete buttons[btn.getName()];
  };this.removeMe = removeMe;
  
  function hide(){
    node.hide();
  };this.hide = hide;
  
  function setButtonPos(btn, p){
    var btNode = btn.getNode();
    btNode.detach();
    if(p >= Object.keys(buttons).length){
      p = Object.keys(buttons).length-1;
    }
    if(p < 0){
      p = Object.keys(buttons).length+p;
    }
    if(p === 0){
      node.find('li:eq(0)').before(btNode).show();
    }else{
      node.find('li:eq('+(p-1)+')').after(btNode).show();
    }
  };this.setButtonPos = setButtonPos;
  
  setup();
}

function cntxMenuButton(name, value, text, img, func){
  if ( !(this instanceof cntxMenuButton) ){
    return new (Function.prototype.bind.apply(
    cntxMenuButton
    , ([this].concat(Array.prototype.slice.call(arguments))) ));
  }
  
  var name 
    , value 
    , text
    , img 
    , func
    , enabled = true
    , menu
    , node
    , _this = this
    ;   
  
    if(typeof name === 'object'){
      value = name.value
      , text = name.text
      , img  =  name.img
      , func = name.func
      , name = name.name
      ; 
    }else{
      name = name
      , value = value
      , text = text
      , img  =  img
      , func = func
      ;  
    }
    
  function getNode(){
    return node;
  };this.getNode = getNode;
    
  function getName(){
    return name;
  };this.getName = getName;
      
  function isEnabled(){
    return enabled;
  };this.isEnabled = isEnabled;
  
  function genHtml(){
    return bTmplt.fillWith({
      name: name,
      text: text,
      img: img
    });
  };this.genHtml = genHtml;

  function getId(){
    return name+'CntxButton';
  };this.getId = getId;

  function onBtnClick(e){
    menu.hide();
    func(menu.getLastEvent(),e, value, _this);
  }
  
  function setup(m){
    menu = m;
    node = $(genHtml());
    menu.addButton(_this);
    node.on('click', onBtnClick);
  };this.setup = setup;
  
  function getId(){
    return name+'CntxButton';
  };this.getId = getId;

  function onBtnClick(e){
    menu.hide();
    func(menu.getLastEvent(),e, value, _this);
  };  
  
  function setup(m){
    menu = m;
    node = $(genHtml());
    menu.addButton(_this);

    node.on('click', onBtnClick);
  };this.setup = setup;
  
  function enable(v){
    if(enabled = (typeof v === 'boolean' ? v : true)){
      node.show();
    }else{
      node.hide();
    }
    menu.checkButtons();
  };this.enable = enable;
  
  function disable(v){
    if(enabled = (typeof v === 'boolean' ? !v : false)){
      node.show();
    }else{
      node.hide();
    }
    menu.checkButtons();
  };this.disable = disable;
  
  function setPos(p){
    menu.setButtonPos(_this,p);
  };this.setPos = setPos;
  
  function remove(){
    node.off('click', onBtnClick);
    node.remove();
    menu.removeMe(this);
  };this.remove = remove;
}
            
            