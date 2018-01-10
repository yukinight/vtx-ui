(function() {
	MapUtil = {
		getInstance : getInstance
	}

	function getInstance() {
		return new Map();
	}
	function Map() {
		this.map = new Array();
	}
	Map.prototype = {
		// Update or Insert
		add : function(key, value) {
			for (var i = 0; i < this.map.length; i++) {
				if (this.map[i].key === key) {
					this.map[i].value = value;
					return;
				}
			}

			this.map[this.map.length] = new struct(key, value);
		},
		// Query
		get : function(key) {
			for (var i = 0; i < this.map.length; i++) {
				if (this.map[i].key === key) {
					return this.map[i].value;
				}
			}

			return undefined;
		},
		getKeyByIndex : function(index) {
			if (index >= 0 && index < this.map.length) {
				return this.map[index].key;
			}

			return null;
		},
		getAllKey:function(){
			var keyArray = new Array();
			for (var i = 0; i < this.map.length; i++) {
				keyArray.push(this.map[i].key);
			}
			return keyArray;
		},
		getByIndex : function(index) {
			if (index >= 0 && index < this.map.length) {
				return this.map[index].value;
			}

			return null;
		},
		getAllValue:function(){
			var keyArray = new Array();
			for (var i = 0; i < this.map.length; i++) {
				keyArray.push(this.map[i].value);
			}
			return keyArray;
		},
		getIndexByKey : function(key) {
			for (var i = 0; i < this.map.length; i++) {
				if (this.map[i].key === key) {
					return i;
				}
			}
			return -1;
		},
		// Delete
		remove : function(key) {
			var v;
			var len = this.map.length;
			for (var i = 0; i < len; ++i) {
				v = this.map.pop();
				if (v.key === key) {
					continue;
				}

				this.map.unshift(v);
			}
		},
		removeByIndex : function(index) {
			var v;
			var len = this.map.length;
			for (var i = 0; i < len; i++) {
				v = this.map.shift();
				if (i === index) {
					continue;
				}

				this.map.push(v);
			}
		},

		// clear
		clear : function() {
			this.map.splice(0, this.map.length);
		},
		removeAll : function() {
			this.map.splice(0, this.map.length);
		},

		count : function() {
			return this.map.length;
		},

		isEmpty : function() {
			return (this.map.length <= 0);
		}
	}
	// 模拟<key, value>数据结构
	function struct(key, value) {
		this.key = key;
		this.value = value;
	}
})();