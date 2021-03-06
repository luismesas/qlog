iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.app.list.html);
		upgradeDatatable();

		self.on(iris.evts.apps.created, refreshItems);
		self.on(iris.evts.apps.deleted, refreshItems);
	};

	self.awake = function() {
		refreshItems();
	};

	function refreshItems(){
		iris.resource(iris.path.resource.app).getAll(drawItems);
		self.get('iconSubtitle').addClass('icon-spin');
	}

	function drawItems(p_items){
		var dt = $(self.get('dtAppList')).dataTable();
		dt.fnDestroy();

		self.destroyUIs('container');
		var i, I = p_items.length;
		for(i = 0; i<I; i++){
			self.ui('container', iris.path.ui.app.item.js, {app: p_items[i]});
		}
		self.get('lblCount').html(I);

		upgradeDatatable();

		self.get('iconSubtitle').removeClass('icon-spin');
	}

	function upgradeDatatable(){
		$(self.get('dtAppList')).dataTable({
			"bJQueryUI": true,
			"sPaginationType": "two_button", // "full_numbers"
			"sDom": '<""l>t<"F"fp>',
			"aLengthMenu": [ 10, 25 ],
			iDisplayLength : 10,
			bDestroy : true,
			bAutoWidth : false,
			fnDrawCallback : function(oSettings){
				// iris.log('table redraw start:' + oSettings._iDisplayStart + ' end:' + oSettings._iDisplayEnd + ' shown:' + oSettings._iDisplayLength);
			}
		});

		$('input[type=checkbox],input[type=radio],input[type=file]').uniform();

		$('select').select2();

		$("span.icon input:checkbox, th input:checkbox").click(function() {
			var checkedStatus = this.checked;
			var checkbox = $(this).parents('.widget-box').find('tr td:first-child input:checkbox');
			checkbox.each(function() {
				this.checked = checkedStatus;
				if (checkedStatus == this.checked) {
					$(this).closest('.checker > span').removeClass('checked');
				}
				if (this.checked) {
					$(this).closest('.checker > span').addClass('checked');
				}
			});
		});
	}

}, iris.path.ui.app.list.js);
