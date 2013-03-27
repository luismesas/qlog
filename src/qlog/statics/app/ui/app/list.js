iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.app.list.html);
	};


	self.awake = function() {
		iris.resource(iris.path.resource.app).getAll(drawItems);
		upgradeDatatable();
	};

	function drawItems(p_items){
		var dt = $(self.get('data-table')).dataTable();
		dt.fnDestroy();

		var i, I = p_items.length;
		for(i = 0; i<I; i++){
			self.ui('appsContainer', iris.path.ui.app.item.js, {app: p_items[i]});
		}
		self.get('lblCount').html(I);

		upgradeDatatable();
	}

	function upgradeDatatable(){
		$(self.get('data-table')).dataTable({
			"bJQueryUI": true,
			"sPaginationType": "two_button", // "full_numbers"
			"sDom": '<""l>t<"F"fp>',
			"aLengthMenu": [ 10, 25 ],
			iDisplayLength : 10,
			bDestroy : true,
			bAutoWidth : false
			//bLengthChange : false
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
