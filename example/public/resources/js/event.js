function Event(sender) {
	this.sender = sender;
	this.listeners = [];
	this.names = [];
}
Event.prototype = {
	attach : function(listener,name) {
		if (this.names.indexOf(name) == -1) {
			this.listeners.push(listener);
			this.names.push(name);
		}else {
			this.listeners[this.names.indexOf(name)] = listener;
		}
	},
	notify : function(args) {
		for ( var i = 0, ii = this.listeners.length; i < ii; i++) {
			this.listeners[i](this.sender, args);
		}
	}
};

function SelectionModel() {
	this.selection = null;
	this.selectionChanged = new Event(this);
}

SelectionModel.prototype = {
	setSelection : function(selection) {
		if (this.selection == selection) {
			return;
		}
		var oldSelection = this.selection;
		this.selection = selection;
		this.selectionChanged.notify({
			oldSelection : oldSelection,
			newSelection : this.selection
		});
	},
	getSelection : function() {
		return this.selection;
	}
};

/*
 * map = { events: { click: new Event(), load: new Event(); },
 * 
 * init: function(){ dojo.connect(map, 'load', function(e){
 * this.events.load.notify(e); }); } }; map.events.load.attach(function(src,
 * evt){
 * 
 * });
 */

function ListModel() {
	this.items = [];
	this.itemsChanged = new Event(this);
}

ListModel.prototype = {
	getItems : function() {
		return this.items;
	},
	addItem : function(item) {
		if (item == null) {
			return;
		}
		if (this.items.indexOf(item) != -1) {
			return;
		}
		this.items.push(item);
		this.itemsChanged.notify({
			type : 'added',
			start : this.items.length - 1,
			length : 1
		});
	},
	addItems : function(items) {
		if (!items || !items.length) {
			return;
		}
		var start = this.items.length;
		for ( var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item != null) {
				if (this.items.indexOf(item) == -1) {
					this.items.push(item);
				}
			}
		}
		var added = this.items.length - start;
		if (added > 0) {
			this.itemsChanged.notify({
				type : 'added',
				start : start,
				length : added
			});
		}
	},
	removeItem : function(item) {
		var idx = this.items.indexOf(item);
		this.removeByIndex(idx);
	},
	removeItemByIndex : function(idx) {
		if (idx < 0 || idx > this.items.length) {
			return;
		}
		this.items.splice(idx, 1);
		this.itemsChanged.notify({
			type : 'removed',
			start : idx,
			length : 1
		});
	}
};

function TreeNode(userObject, isLeaf) {
	this.parent = null;
	this.userObject = userObject;
	if (isLeaf) {
		this.isLeaf = false;
		this.children = [];
	} else {
		this.isLeaf = true;
	}
}

function TreeModel() {
	this.roots = [];
	this.treeEvent = new Event(this);
}

TreeModel.prototype = {
	appendChild : function(parent, node) {
		if (!parent) {
			this.roots.push(node);
			node.parent = null;
		} else if (!parent.isLeaf) {
			parent.children.push(node);
			node.parent = parent;
		}
		this.treeEvent.notify({});
	}
};
