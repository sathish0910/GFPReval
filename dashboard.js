// Summary      : creating managers dashboard
// Ceated by    : K Kiran Kumar Reddy
// Modified by  : E Sathish
// Modified     : 29-Apr-2021
dashboard = { vars: { dashboard: [] }, fn: {} };
dashboard.vars.webUrl = _spPageContextInfo.webAbsoluteUrl;
dashboard.vars.currentUserID = _spPageContextInfo.userId;
dashboard.vars.gfpData = [];
dashboard.vars.getCarouselData = [];
dashboard.vars.getMyAppsContents = [];
dashboard.vars.getMyAppsMilestones = [];
dashboard.vars.currentQuarter = "";
dashboard.vars.currentQuarterId = "";
dashboard.vars.startDate = "";
dashboard.vars.endDate = "";
dashboard.vars.listNames = {
    carousel_ListName: "GFPGallery",
    contents_listname: "HomeContent",
    myGFP_ListName: "GFP Revalidation",
    quarter_ListName: "Quarters"
};
$(document).ready(function () {
    dashboard.fn.getPageContent();
    dashboard.fn.common();
    var clickEvent = false;
    $("#myCarousel").on("click", ".nav a", function () {
        clickEvent = true;
        $(this).parent().siblings().removeClass("active");
        $(this).parent().addClass("active");
    }).on("slid.bs.carousel", function (e) {
        if (!clickEvent) {
            itemIndex = $(e.relatedTarget).index();
            targetNavItem = $(".nav li[data-slide-to='" + itemIndex + "']");
            $(".nav li").not(targetNavItem).removeClass("active");
            targetNavItem.addClass("active");
        }
        clickEvent = false;
    });
});
dashboard.fn.common = function () {
    dashboard.fn.getQuarter();
    dashboard.fn.getData(dashboard.vars.currentUserID);
    if(dashboard.vars.gfpData.length > 0){
        dashboard.vars.bindgfpData("standard", _.groupBy(dashboard.vars.gfpData, 'UserType')["Standard User"] === undefined ? []: _.groupBy(dashboard.vars.gfpData, 'UserType')["Standard User"]);
        dashboard.vars.bindgfpData("privilege", _.groupBy(dashboard.vars.gfpData, 'UserType')["Privilege User"] === undefined ? []: _.groupBy(dashboard.vars.gfpData, 'UserType')["Privilege User"]);
    }else{
        dashboard.vars.bindgfpData("standard", []);
        dashboard.vars.bindgfpData("privilege", []);
    }
}
dashboard.fn.getPageContent = function () {
    var query = "?$select=ID,Title,Image,ImageDescription,TabTitle,DirectionLink&$top=5000";
    InjectScript.fn.getListItems(dashboard.vars.webUrl, dashboard.vars.listNames.carousel_ListName, query, true).done(function (data) {
        dashboard.vars.getCarouselData = data;
    });
    var query = "?$select=ID,Title,KpiDescription&$top=5000";
    InjectScript.fn.getListItems(dashboard.vars.webUrl, dashboard.vars.listNames.contents_listname, query, true).done(function (data) {
        $.each(data, function (index, val) {
            switch (val.Title) {
                case "GFP Manager Dashboard":
                    dashboard.vars.getMyAppsContents.push(data[index]);
                    break;
                case "Milestones":
                    dashboard.vars.getMyAppsMilestones.push(data[index]);
                    break;
            }
        });
    });
    dashboard.fn.mapCarouselData();
}
dashboard.fn.getQuarter = function () {
    var query = "?$select=ID,Title,QuarterStatus,StartDate,EndDate&$filter=QuarterStatus eq 'Active'";
    InjectScript.fn.getListItems(dashboard.vars.webUrl, dashboard.vars.listNames.quarter_ListName, query, true).done(function (data) {
        if (data.length > 0) {
            dashboard.vars.currentQuarter = data[0].Title;
            dashboard.vars.currentQuarterId = data[0].ID;
            dashboard.vars.startDate = data[0].StartDate;
            dashboard.vars.endDate = data[0].EndDate;
        }
    });
}
dashboard.fn.getData = function (loggedInUserID) {
    var query = "?$select=ID,Title,Quarter/Title,UserType,RESPONSIBILITY_NAME,EIN,UserName,USER_EMAIL_ADDRESS,RESP_GFR,GFP_GROUP_NAME,LineManager,LM_EMAIL_ADDRESS,CFM_Name/ID,CFM_Name/Title,CFM_EMAIL_ADDRESS,ASSIGNMENT_START_DATE,ASSIGNMENT_LAST_UPDATE_DATE,GFP_Status,Application_Status,Actioned_User/ID,Actioned_Date&$expand=Quarter,CFM_Name,Actioned_User&$filter=(CFM_Name/ID eq " + loggedInUserID + " and Quarter/Title eq '" + dashboard.vars.currentQuarter + "')&$top=5000";
    InjectScript.fn.getListItems(dashboard.vars.webUrl, dashboard.vars.listNames.myGFP_ListName, query, true).done(function (data) {
        dashboard.vars.gfpData = data;
    });
}
dashboard.fn.mapCarouselData = function () {
    $(".carousel-inner, .nav-pills, .myApps-Description, .myApps-Milestones").empty();
    $(".carousel-inner").append(_.map(dashboard.vars.getCarouselData, function (val, index) {
        return dashboard.fn.getCarouselSlide(val, index);
    }).join(''));
    $('.myApps-Description').append(_.map(dashboard.vars.getMyAppsContents, function (val, index) {
        return val.KpiDescription
    }).join(''));
    $('.myApps-Milestones').append(_.map(dashboard.vars.getMyAppsMilestones, function (val, index) {
        return val.KpiDescription
    }).join(''));
}
dashboard.fn.getCarouselSlide = function (data, rowNo) {
    $(".nav-pills").append('<li data-target="#myCarousel" data-slide-to="' + rowNo + '" class="nav-item ' + (rowNo === 0 ? "active" : "") + '"><a href="#" class="nav-link"><strong>' + data.TabTitle + '</strong></a></li>');

    return '<div class="item carousel-item ' + (rowNo === 0 ? "active" : "") + '">' +
        '<img src="' + data.Image.Url + '" alt="">' +
        '<div class="carousel-caption">' +
        '<h2 style="display: none;">' + data.Title + '</h2>' +
        '<p style="display: ' + (data.ImageDescription === null ? "none" : 'block') + '">' + data.ImageDescription + '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
}
dashboard.vars.bindgfpData = function (gridId, data) {
    var dataGrid = $("#" + gridId + "").dxDataGrid({
        dataSource: data,
        allowColumnReordering: false,
        allowColumnResizing: true,
        columnsAutoWidth: true,
        showBorders: true,
        remoteOperations: false,
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [100],
            showNavigationButtons: true
        },
        paging: {
            pageSize: 100,
            pageIndex: 0
        },
        wordWrapEnabled: true,
        editing: {
            mode: "cell",
            allowUpdating: true
        },
        columnChooser: {
            enabled: false
        },
        columnFixing: {
            enabled: true
        },
        selection: {
            mode: "multiple"       
        },
        filterRow: {
            visible: false,
            applyFilter: "auto"
        },
        searchPanel: {
            visible: false,
            width: 240,
            placeholder: "Search..."
        },
        headerFilter: {
            visible: true
        },
        export: {
            enabled: true,
            allowExportSelectedData: false
        },
        onExporting: function (e) {
            var workbook = new ExcelJS.Workbook();
            var worksheet = workbook.addWorksheet('GFP');
            DevExpress.excelExporter.exportDataGrid({
                component: e.component,
                worksheet: worksheet,
                autoFilterEnabled: true
            }).then(function () {
                workbook.xlsx.writeBuffer().then(function (buffer) {
                    saveAs(new Blob([buffer], {
                        type: 'application/octet-stream'
                    }), 'GFP ' + moment().format('DDMMYYYYHHmmss') + '.xlsx');
                });
            });
            e.cancel = true;
        },
        onContentReady: function (e) {
            var toolbar = e.element.find('.dx-datagrid-header-panel .dx-toolbar').dxToolbar('instance');
            toolbar.on('optionChanged', function (arg) {
                dashboard.fn.addCustomItem(toolbar);
            });
            dashboard.fn.addCustomItem(toolbar);
        },
        columns: [{
            dataField: "RESPONSIBILITY_NAME",
            caption: "Responsibility Name",
            width: 100,
            alignment: 'center',
            allowEditing: false
        }, {
            dataField: "EIN",
            caption: "User EIN",
            width: 'auto',
            alignment: 'center',
            allowEditing: false,
            headerFilter: {
                allowSearch: true
            },
            cellTemplate: function (container, options) {
                $("<span/>").append(options.value.slice(-9)).appendTo(container);
            }
        }, {
            dataField: "UserName",
            caption: "User Name",
            width: 'auto',
            alignment: 'center',
            allowEditing: false,
            headerFilter: {
                allowSearch: true
            }
        }, {
            dataField: "LineManager",
            caption: "LM Name",
            width: 'auto',
            alignment: 'center',
            allowEditing: false,
            headerFilter: {
                allowSearch: true
            }
        }, {
            dataField: "RESP_GFR",
            caption: "RESP_GFR",
            width: 'auto',
            alignment: 'center',
            allowEditing: false,
            headerFilter: {
                allowSearch: true
            }
        }, {
            dataField: "CFM_Name.Title",
            caption: "CFM Name",
            width: 'auto',
            alignment: 'center',
            allowEditing: false
        }, {
            dataField: "ASSIGNMENT_START_DATE",
            caption: "Assignment Start Date",
            width: 'auto',
            alignment: 'center',
            allowEditing: false
        }, {
            dataField: "ASSIGNMENT_LAST_UPDATE_DATE",
            caption: "Assignment Last Update Date",
            width: 'auto',
            alignment: 'center',
            allowEditing: false
        }, {
            dataField: "GFP_Status",
            caption: "GFP Status",
            width: 200,
            alignment: 'center',
            allowEditing: false,
            cellTemplate: function (container, options) {
                var dropDownOptions = "";
                switch (options.value) {
                    case "REMOVE":
                        dropDownOptions = "<option value=''></option><option value='REMOVE' selected>REMOVE</option><option value='RETAIN'>RETAIN</option>";
                        break;
                    case "RETAIN":
                        dropDownOptions = "<option value=''></option><option value='REMOVE'>REMOVE</option><option value='RETAIN' selected>RETAIN</option>";
                        break;
                    case "DOES NOT REPORT TO ME":
                        dropDownOptions = "<option value=''></option><option value='REMOVE'>REMOVE</option><option value='RETAIN'>RETAIN</option>";
                        break;
                    case "":
                    case null:
                    case undefined:
                        dropDownOptions = "<option value='' selected></option><option value='REMOVE'>REMOVE</option><option value='RETAIN'>RETAIN</option>";
                        break;
                }
                if (new Date().format('dd/MM/yyyy') >= moment.utc(dashboard.vars.startDate).format('DD/MM/YYYY') && new Date().format('dd/MM/yyyy') <= moment.utc(dashboard.vars.endDate).format('DD/MM/YYYY')) {
                    $('<select/>').addClass('select-css gfpstatusSelect')
                        .append(dropDownOptions)
                        .appendTo(container);
                } else {
                    $('<select/>').attr('disabled', true).addClass('select-css gfpstatusSelect')
                        .append(dropDownOptions)
                        .appendTo(container);
                }
            },
        }, {
            dataField: "ID",
            width: 100,
            alignment: 'center',
            caption: 'Action',
            allowEditing: false,
            cellTemplate: function (container, options) {
                var buttonText = "";
                if(data.length > 0){
                    var checkStatus = $.grep(data, function (element, index) {
                        return element.Id === options.value;
                    });
                    if (checkStatus.length > 0) {
                        checkStatus = checkStatus[0];
                        switch (checkStatus.Application_Status) {
                            case "Submitted":
                                buttonText = "Update";
                                break;
                            case "Not Submitted":
                                buttonText = "Submit";
                                break;
                        }
                    }
                }
                if (new Date().format('dd/MM/yyyy') >= moment.utc(dashboard.vars.startDate).format('DD/MM/YYYY') && new Date().format('dd/MM/yyyy') <= moment.utc(dashboard.vars.endDate).format('DD/MM/YYYY')) {
                    $('<button/>').attr('type', 'button').attr('reqID', options.value).addClass('btn dx-button-mode-contained dx-button-default dx-state-active submitBtn')
                        .append(buttonText)
                        .on('dxclick', function () {
                            var Status = $($(this).parent().parent()).find('.gfpstatusSelect').val();
                            var id = parseInt($(this).attr('reqID'));
                            switch (Status) {
                                case "":
                                case "Ã‚ ":
                                case null:
                                case undefined:
                                case "undefined":
                                    $($(this).parent().parent()).find('.gfpstatusSelect').css('border', '1px solid red');
                                    alert("Please select gfp status and submit");
                                    break;
                                case "REMOVE":
                                case "RETAIN":
                                case "DOES NOT REPORT TO ME":
                                    dashboard.fn.updateRequest(id, Status, "Submitted");
                                    $($(this).parent().parent()).find('.gfpstatusSelect').css('border', '1px solid #aaa');
                                    $(this).text("Update");
                                    break;
                            }
                        })
                        .appendTo(container);
                } else {
                    $('<button/>').attr('disabled', true).attr('type', 'button').attr('reqID', options.value).addClass('btn dx-button-mode-contained dx-button-default dx-state-active submitBtn')
                    .append(buttonText)
                    .on('dxclick', function () {
                        var Status = $($(this).parent().parent()).find('.gfpstatusSelect').val();
                        var id = parseInt($(this).attr('reqID'));
                        switch (Status) {
                            case "":
                            case "Ã‚ ":
                            case null:
                            case undefined:
                            case "undefined":
                                $($(this).parent().parent()).find('.gfpstatusSelect').css('border', '1px solid red');
                                alert("Please select gfp status and submit");
                                break;
                            case "REMOVE":
                            case "RETAIN":
                            case "DOES NOT REPORT TO ME":
                                dashboard.fn.updateRequest(id, Status, "Submitted");
                                $($(this).parent().parent()).find('.gfpstatusSelect').css('border', '1px solid #aaa');
                                $(this).text("Update");
                                break;
                        }
                    })
                    .appendTo(container);
                }

            }
        }, {
            dataField: "Application_Status",
            caption: "Application Status",
            width: 130,
            alignment: 'center',
            allowEditing: false,
            sortOrder: "asc",
            cellTemplate: function (container, options) {
                switch (options.value) {
                    case "Submitted":
                        $("<button/>").attr('type', 'button').attr('style', 'background: green; color: white; width:100%; font-weight: bold;').append(options.value).appendTo(container);
                        break;
                    case "Not Submitted":
                        $("<button/>").attr('type', 'button').attr('style', 'background: #FFBF00; width:100%; font-weight: bold;').append(options.value).appendTo(container);
                        break;
                }
            }
        }],
        onToolbarPreparing: function (e) {
            var dataGrid = e.component;
            if(data.length > 0){
                var completedRecordsCount = $.grep(data, function (element, index) {
                    return element.ApplicationStatus === "Submitted";
                });
            }else{
                var completedRecordsCount = [];
            }
            e.toolbarOptions.items.unshift({
                location: "before",
                template: function () {
                    return $("<div/>")
                        .addClass("informer")
                        .append(
                            $("<h4 />")
                            .addClass("count")
                            .text(completedRecordsCount.length + " out of " + dashboard.fn.getGroupCount("ID", data)),
                            $("<span />")
                            .addClass("name")
                            .text("Total Count")
                        );
                }
            }, {
                location: "after",
                widget: "dxButton",
                options: {
                    icon: "refresh",
                    onClick: function () {
                        dashboard.fn.common();
                    }
                }
            });

        }
    }).dxDataGrid("instance");

    $("#select-all-mode").dxSelectBox({
        dataSource: ["allPages", "page"],
        value: "allPages",
        onValueChanged: function (data) {
            dataGrid.option("selection.selectAllMode", data.value);
        }
    });

    $("#show-checkboxes-mode").dxSelectBox({
        dataSource: ["none", "onClick", "onLongTap", "always"],
        value: "onClick",
        onValueChanged: function (data) {
            dataGrid.option("selection.showCheckBoxesMode", data.value);
            $("#select-all-mode").dxSelectBox("instance").option("disabled", data.value === "none");
        }
    });
    $('.dx-icon-export-excel-button').addClass('fa fa-file-excel-o');
    $('.dx-icon-export-excel-button').removeClass('dx-icon-export-excel-button');
};
dashboard.fn.getGroupCount = function (groupField, data) {
    return DevExpress.data.query(data)
        .groupBy(groupField)
        .toArray().length;
}
dashboard.fn.addCustomItem = function (toolbar) {
    if (new Date().format('dd/MM/yyyy') >= moment.utc(dashboard.vars.startDate).format('DD/MM/YYYY') && new Date().format('dd/MM/yyyy') <= moment.utc(dashboard.vars.endDate).format('DD/MM/YYYY')) {
        var items = toolbar.option('items');
        var myItem = DevExpress.data.query(items).filter(function (item) {
            return item.name == 'myButton';
        }).toArray();
        if (!myItem.length) {
            items.push({
                location: 'after',
                widget: 'dxButton',
                name: 'myButton',
                options: {
                    text: 'Remove',
                    onClick: function (e) {
                        dashboard.fn.updateAllRequests("REMOVE");
                    }
                }
            }, {
                location: 'after',
                widget: 'dxButton',
                name: 'myButton',
                options: {
                    text: 'Retain',
                    onClick: function (e) {
                        dashboard.fn.updateAllRequests("RETAIN");
                    }
                }
            },
            // {
            //     location: 'after',
            //     widget: 'dxButton',
            //     name: 'myButton',
            //     options: {
            //         text: 'Does not report to me',
            //         onClick: function (e) {
            //             dashboard.fn.updateAllRequests("DOES NOT REPORT TO ME");
            //         }
            //     }
            // },
            {
                location: 'after',
                widget: 'dxButton',
                name: 'myButton',
                options: {
                    text: 'Submit All',
                    onClick: function (e) {
                        dashboard.fn.updateAllRequests("ALL");
                    }
                }
            });
            toolbar.option('items', items);
        }
    }    
}
dashboard.fn.updateRequest = function (reqId, status) {
    var restBody = {
        "GFP_Status": status,
        "Application_Status": "Submitted",
        "Actioned_Date": moment().utc().format('MM/DD/YYYY hh:mm:ss'),
        "Actioned_UserId": dashboard.vars.currentUserID
    };
    InjectScript.fn.updateListItem(dashboard.vars.webUrl, dashboard.vars.listNames.myGFP_ListName, reqId, restBody, false, false).done(function (data) {
        dashboard.fn.common();
        alert('Updated successfully!');
    });
}
dashboard.fn.updateAllRequests = function (key) {
    var selectedData = [];
    var rows = $('.dx-datagrid-rowsview table tr[aria-selected="true"]');
    rows = rows.slice(0, rows.length / 2);
    if (rows.length > 0) {
        $.each(rows, function (index, val) {
            var reqId = parseInt($($(val).find('.submitBtn')).attr('reqId'));
            var reqStatus = $(val).find('.gfpstatusSelect').val();
            switch (key) {
                case "ALL":
                    switch (reqStatus) {
                        case "":
                        case "Ã‚ ":
                        case null:
                        case undefined:
                        case "undefined":
                            $(val).find('.gfpstatusSelect').css('border', '1px solid red');
                            break;
                        case "REMOVE":
                        case "RETAIN":
                        case "DOES NOT REPORT TO ME":
                            $(val).find('.gfpstatusSelect').css('border', '1px solid #aaa');
                            reqStatus = $(val).find('.gfpstatusSelect').val();
                            selectedData.push({
                                "requestId": reqId,
                                "requestStatus": reqStatus
                            });
                            break;
                    }
                    break;
                case "REMOVE":
                case "RETAIN":
                case "DOES NOT REPORT TO ME":
                    selectedData.push({
                        "requestId": reqId,
                        "requestStatus": key
                    });
                    break;
            }
        });
        if (rows.length === selectedData.length) {
            var lengthCount = selectedData.length;
            $.each(selectedData, function (ind, v) {
                var restBody = {
                    "GFP_Status": v.requestStatus,
                    "Application_Status": "Submitted",
                    "Actioned_Date": moment().utc().format('MM/DD/YYYY hh:mm:ss'),
                    "Actioned_UserId": dashboard.vars.currentUserID
                };
                InjectScript.fn.updateListItem(dashboard.vars.webUrl, dashboard.vars.listNames.myGFP_ListName, v.requestId, restBody, false, false).done(function (data) {
                    if (lengthCount === (ind + 1)) {
                        dashboard.fn.common();
                        alert('Updated successfully!');
                    }
                });
            });
        } else {
            alert("Please fill mandatory fields for selected requests");
        }
    } else {
        alert("Please select atleast one row");
    }
}
