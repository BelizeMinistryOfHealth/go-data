"use strict";const templateParser=require("./../../components/templateParser");module.exports=function(e){e.hasController=!1,e.referenceDataFieldsToCategoryMap={disease:"LNG_REFERENCE_DATA_CATEGORY_DISEASE"},e.referenceDataFields=Object.keys(e.referenceDataFieldsToCategoryMap),e.observe("before save",function(e,t){templateParser.beforeHook(e,t)}),e.observe("after save",function(e,t){templateParser.afterHook(e,t)}),e.observe("loaded",function(e,t){["caseInvestigationTemplate","contactFollowUpTemplate","labResultsTemplate"].forEach(function(t){templateParser.orderQuestions(e.data[t])}),t()})};