var C = rbv_api.selectQuery("SELECT id,name FROM Service_Line", 999);
var D = rbv_api.selectQuery("SELECT id,name FROM job", 999);
var E = rbv_api.selectQuery("SELECT id,name FROM Asset_Type", 999);
var F = rbv_api.selectQuery("SELECT id,Days_Expired_INT FROM MDE", 999);
var G = rbv_api.selectQuery("SELECT id,name, Type_of_NPT_Report, Type_READ_ONLY, Net_time, Event_start_date FROM NPT_Report WHERE (Type_of_NPT_Report IS NOT NULL AND Type_READ_ONLY IS NOT NULL AND Net_time IS NOT NULL AND Event_start_date IS NOT NULL) ORDER BY Type_of_NPT_Report", 999);
var H = rbv_api.selectQuery("SELECT id, name, Type_of_NPT_Report, Type_READ_ONLY, Net_time, Event_start_date FROM NPT_Report WHERE (Type_of_NPT_Report IS NOT NULL AND Type_READ_ONLY IS NOT NULL AND  Net_time IS NOT NULL AND Event_start_date IS NOT NULL)", 999);
var I = rbv_api.selectQuery("SELECT id, name, Event_start_date, createdAt, Job_Number_related, Job_ID_RF FROM name1 WHERE (Event_start_date IS NOT NULL AND createdAt IS NOT NULL AND Job_Number_related IS NOT NULL AND Job_ID_RF IS NOT NULL) ORDER BY Job_ID_RF", 999);
var J = rbv_api.selectQuery("SELECT id, name, R1665668#value, Location_Job, Field, createdAt FROM Job WHERE (R1665668#value IS NOT NULL AND Location_Job IS NOT NULL AND Field IS NOT NULL AND createdAt IS NOT NULL) ORDER BY  Location_Job", 999);
var K = rbv_api.selectQuery("SELECT MDE_Type_READ_ONLY FROM MDE_Type ORDER BY MDE_Type_READ_ONLY", 999);
var L = rbv_api.selectQuery("SELECT id, Days_Expired_INT, Type_READ_ONLY FROM MDE ORDER BY Type_READ_ONLY", 999);
rbv_api.setFieldValue("DummyTest", "{!id}", "File_Upload_Test", null);


/* ---------------------------------------------------------------------- *
 *             COLLECT DATA FOR QVIEW/Jobs By Service Line chart          *
 * ---------------------------------------------------------------------- */
var CollservL = []; // X axis: Service Line names.
var CollJobCn = []; // Y axis: Job counters By Service Line.


// Iterate through Service Line list.
for (var i_sl = 0; i_sl < C.length; i_sl++) {
    var slId = C[i_sl][0]; // Get Service Line's id.
    var slName = C[i_sl][1]; // Get Service Line's name.
    var slJobs = rbv_api.getRelatedIds("R3746971", slId); // Get Service Line's Job list.


    // Collect Service Line's name and Service Line's number of Jobs for both axis (x, y).
    CollservL.push('"' + slName.toString() + '"');
    CollJobCn.push(slJobs.length);
}


for (var j = 0; j < CollservL.length; j++) {
    rbv_api.println("Service Line's name: " + CollservL[j] + " and its count" + CollJobCn[j]);
    rbv_api.println("");
}



/* -------------------------------------------------------------------------- *
 *          COLLECT DATA FOR QVIEW/Hours of NPT By NPT Type chart             *
 *                                                                            *
 * NOTE: This chart contemplate only NPTs created during last six months.     *
 * -------------------------------------------------------------------------- */
var CollNptTp = []; // X axis: NPT Types.
var CollNptCn = []; // Y axis: Hour of NPT counters By NPT Type.

if (G.length > 0) {
    var currentType = G[0][2]; // Start with the first Type number (from the GROUP BY SELECT).
    var currentName = G[0][3]; // Start with the first Type name  (from the GROUP BY SELECT).
    var HoursCnt = 0; // NPT's hours counter (this variable is re-started when a control break occurs in the GROUP BY SELECT).
    var one_day = 1000 * 60 * 60 * 24; // One day in milliseconds.
    var var_today = new Date().getTime(); // Today in milliseconds.
    var var_sixM = var_today - (one_day * 183); // Calculate today in milliseconds minus 6 months in milliseconds.


    // Iterate through NPT list.
    for (var i_Npt = 0; i_Npt < G.length; i_Npt++) {
        var NptName = G[i_Npt][1]; // Get NPT's name.
        var NptType = G[i_Npt][2]; // Get NPT's Type number.
        var NptTypNm = G[i_Npt][3]; // Get NPT's Type name.
        var NptNetHr = G[i_Npt][4]; // Get NPT's Net hours.
        var NptDateC = G[i_Npt][5]; // Get NPT's Date of creation.


        // Include only NPTs created during last six months.
        if (NptDateC.getTime() > var_sixM) {

            // Compare current NPT Type against last NPT Type. If different then register the NPT's hours counter and reset the counter.
            if (Number(NptType) === Number(currentType)) {
                HoursCnt = HoursCnt + Number(NptNetHr);
            } else {
                CollNptTp.push('"' + currentName.toString() + '"');
                currentType = NptType;
                currentName = NptTypNm;

                // Normalize counter's scale.
                if (HoursCnt > 30) HoursCnt = 15;

                CollNptCn.push(HoursCnt);
                HoursCnt = (+NptNetHr);
            }
        }
    }

    // Normalize counter's scale.
    if (HoursCnt > 30) HoursCnt = 15;

    CollNptTp.push('"' + currentName.toString() + '"');
    CollNptCn.push(HoursCnt);


    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    for (var j = 0; j < CollNptTp.length; j++) {
        rbv_api.println("NPT's hours for NPT Type: " + CollNptTp[j] + " are " + CollNptCn[j] + " hours of NPT");
    }
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
}



/* -------------------------------------------------------------------------- *
 *          COLLECT DATA FOR QVIEW/Hours of NPT By Month Type chart           *
 *                                                                            *
 * NOTE: This chart contemplate NPTs created during last year period and      *
 *       during current year until current month.                             *
 * -------------------------------------------------------------------------- */
var YrMthNPTs = []; // X axis: Last Year, accumulated current year, months
var NpthrsCn = []; // Y axis: Hours of NPT counters.

var HoursCnt = 0; // NPT's hours counter (this variable is re-started when a control break occurs in the GROUP BY SELECT).
var one_day = 1000 * 60 * 60 * 24; // One day in milliseconds.
var var_today = new Date().getTime(); // Today in milliseconds.

var curryear = new Date().getFullYear(); // Current year.
var curryearJanuary = new Date(curryear, 1, 0).getTime(); // Current year's January last day in milliseconds.
var curryearFebruary = new Date(curryear, 2, 0).getTime(); // Current year's February last day in milliseconds.
var curryearMarch = new Date(curryear, 3, 0).getTime(); // Current year's May last day in milliseconds.
var curryearApril = new Date(curryear, 4, 0).getTime(); // Current year's April last day in milliseconds.
var curryearMay = new Date(curryear, 5, 0).getTime(); // Current year's May last day in milliseconds.
var curryearJune = new Date(curryear, 6, 0).getTime(); // Current year's June last day in milliseconds.
var curryearJuly = new Date(curryear, 7, 0).getTime(); // Current year's July last day in milliseconds.
var curryearAug = new Date(curryear, 8, 0).getTime(); // Current year's August last day in milliseconds.
var curryearSept = new Date(curryear, 9, 0).getTime(); // Current year's September last day in milliseconds.
var curryearOct = new Date(curryear, 10, 0).getTime(); // Current year's October last day in milliseconds.
var curryearNov = new Date(curryear, 11, 0).getTime(); // Current year's November last day in milliseconds.
var curryearDec = new Date(curryear, 12, 0).getTime(); // Current year's December last day in milliseconds.

var lastyear = new Date().getFullYear() - 1; // Last year.
var lastYearJanuary = new Date(lastyear, 0, 1).getTime(); // Last year's January 1st in milliseconds.
var lastYearDecember = new Date(lastyear, 11, 31).getTime(); // Last year's December 31th in milliseconds.

var lastYcnt = 0; // Last year's NPT's hours counter.
var currYcnt = 0; // Current year's NPT's hours counter.
var Jancnt = 0; // January's NPT's hours counter.
var Febcnt = 0; // February's NPT's hours counter.
var Marcnt = 0; // March's NPT's hours counter.
var Aprcnt = 0; // April's NPT's hours counter.
var Maycnt = 0; // May's NPT's hours counter.
var Juncnt = 0; // June's NPT's hours counter.
var Julcnt = 0; // July's NPT's hours counter.
var Augcnt = 0; // August's NPT's hours counter.
var Sepcnt = 0; // September's NPT's hours counter.
var Octcnt = 0; // October's NPT's hours counter.
var Novcnt = 0; // November's NPT's hours counter.
var Deccnt = 0; // December's NPT's hours counter.


if (H.length > 0) {
    /* --------------------------------------------- *
     *             Collect all NPT counters          *
     * --------------------------------------------- */

    // Iterate through NPT list.
    for (var i_Npt = 0; i_Npt < H.length; i_Npt++) {
        var NptName = H[i_Npt][1]; // Get NPT's name.
        var NptNetHr = H[i_Npt][4]; // Get NPT's Net hours.
        var NptDateC = H[i_Npt][5]; // Get NPT's event start date.
        var nptCrtDt = NptDateC.getTime(); // NPT's Date of creation in milliseconds.


        // Is it an NPT created during last year period?
        if (nptCrtDt >= lastYearJanuary && nptCrtDt <= lastYearDecember) {
            lastYcnt = lastYcnt + (+NptNetHr); // Increment last year period counter.
        }

        // Is it an NPT created during current year's January?
        if (nptCrtDt > lastYearDecember && nptCrtDt <= curryearJanuary) {
            Jancnt = Jancnt + (+NptNetHr); // Increment current year's January counter.
        }

        // Is it an NPT created during current year's February?
        if (nptCrtDt > curryearJanuary && nptCrtDt <= curryearFebruary) {
            Febcnt = Febcnt + (+NptNetHr); // Increment current year's February counter.
        }

        // Is it an NPT created during current year's March?
        if (nptCrtDt > curryearFebruary && nptCrtDt <= curryearMarch) {
            Marcnt = Marcnt + (+NptNetHr); // Increment current year's March counter.
        }

        // Is it an NPT created during current year's April?
        if (nptCrtDt > curryearMarch && nptCrtDt <= curryearApril) {
            Aprcnt = Aprcnt + (+NptNetHr); // Increment current year's April counter.
        }

        // Is it an NPT created during current year's May?
        if (nptCrtDt > curryearApril && nptCrtDt <= curryearMay) {
            Maycnt = Maycnt + (+NptNetHr); // Increment current year's May counter.
        }

        // Is it an NPT created during current year's June?
        if (nptCrtDt > curryearMay && nptCrtDt <= curryearJune) {
            Juncnt = Juncnt + (+NptNetHr); // Increment current year's June counter.
        }

        // Is it an NPT created during current year's July?
        if (nptCrtDt > curryearJune && nptCrtDt <= curryearJuly) {
            Julcnt = Julcnt + (+NptNetHr); // Increment current year's July counter.
        }

        // Is it an NPT created during current year's August?
        if (nptCrtDt > curryearJuly && nptCrtDt <= curryearAug) {
            Augcnt = Augcnt + (+NptNetHr); // Increment current year's August counter.
        }

        // Is it an NPT created during current year's September?
        if (nptCrtDt > curryearAug && nptCrtDt <= curryearSept) {
            Sepcnt = Sepcnt + (+NptNetHr); // Increment current year's September counter.
        }

        // Is it an NPT created during current year's October?
        if (nptCrtDt > curryearSept && nptCrtDt <= curryearOct) {
            Octcnt = Octcnt + (+NptNetHr); // Increment current year's October counter.
        }

        // Is it an NPT created during current year's November?
        if (nptCrtDt > curryearOct && nptCrtDt <= curryearNov) {
            Novcnt = Novcnt + (+NptNetHr); // Increment current year's November counter.
        }

        // Is it an NPT created during current year's December?
        if (nptCrtDt > curryearNov && nptCrtDt <= curryearDec) {
            Deccnt = Deccnt + (+NptNetHr); // Increment current year's December counter.
        }

    }

    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("Last year's counter is: " + lastYcnt);
    rbv_api.println("January counter is: " + Jancnt);
    rbv_api.println("February counter is: " + Febcnt);
    rbv_api.println("March counter is: " + Marcnt);
    rbv_api.println("April counter is: " + Aprcnt);
    rbv_api.println("May counter is: " + Maycnt);
    rbv_api.println("June counter is: " + Juncnt);
    rbv_api.println("July counter is: " + Julcnt);
    rbv_api.println("August counter is: " + Augcnt);
    rbv_api.println("September counter is: " + Sepcnt);
    rbv_api.println("October counter is: " + Octcnt);
    rbv_api.println("November counter is: " + Novcnt);
    rbv_api.println("December counter is: " + Deccnt);



    /* --------------------------------------------- *
     *     Fill JSON depending on current month      *
     * --------------------------------------------- */

    // Is January?
    if (var_today > lastYearDecember && var_today <= curryearJanuary) {
        YrMthNPTs.push('"' + "January" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 100) lastYcnt = 10;
        if (Jancnt > 100) Jancnt = 10;

        NpthrsCn.push(Jancnt); // Y axis.
        NpthrsCn.push(lastYcnt);

    }

    // Is February?
    if (var_today > curryearJanuary && var_today <= curryearFebruary) {
        YrMthNPTs.push('"' + "February" + '"', '"' + "January" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;


        NpthrsCn.push(Febcnt); // Y axis.
        NpthrsCn.push(Jancnt);
        NpthrsCn.push(lastYcnt);
    }

    // Is March?
    if (var_today > curryearFebruary && var_today <= curryearMarch) {
        YrMthNPTs.push('"' + "March" + '"', '"' + "February" + '"', '"' + "January" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;


        NpthrsCn.push(Marcnt); // Y axis.
        NpthrsCn.push(Febcnt);
        NpthrsCn.push(Jancnt);
        NpthrsCn.push(lastYcnt);
    }

    // Is April?
    if (var_today > curryearMarch && var_today <= curryearApril) {
        YrMthNPTs.push('"' + "April" + '"', '"' + "March" + '"', '"' + "February" + '"', '"' + "January" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;


        NpthrsCn.push(Aprcnt);
        NpthrsCn.push(Marcnt);
        NpthrsCn.push(Febcnt);
        NpthrsCn.push(Jancnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is May?
    if (var_today > curryearApril && var_today <= curryearMay) {
        YrMthNPTs.push('"' + "May" + '"', '"' + "April" + '"', '"' + "March" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;


        currYcnt = Jancnt + Febcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Maycnt);
        NpthrsCn.push(Aprcnt);
        NpthrsCn.push(Marcnt);
        NpthrsCn.push(currYcnt); // Y axis.
        NpthrsCn.push(lastYcnt);
    }

    // Is June?
    if (var_today > curryearMay && var_today <= curryearJune) {
        YrMthNPTs.push('"' + "June" + '"', '"' + "May" + '"', '"' + "April" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;


        currYcnt = Jancnt + Febcnt + Marcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Juncnt);
        NpthrsCn.push(Maycnt);
        NpthrsCn.push(Aprcnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is July?
    if (var_today > curryearJune && var_today <= curryearJuly) {
        YrMthNPTs.push('"' + "July" + '"', '"' + "June" + '"', '"' + "May" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;


        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Julcnt);
        NpthrsCn.push(Juncnt);
        NpthrsCn.push(Maycnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is August?
    if (var_today > curryearJuly && var_today <= curryearAug) {
        YrMthNPTs.push('"' + "August" + '"', '"' + "July" + '"', '"' + "June" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;
        if (Augcnt > 30) Augcnt = 15;

        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt + Maycnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Augcnt);
        NpthrsCn.push(Julcnt);
        NpthrsCn.push(Juncnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is September?
    if (var_today > curryearAug && var_today <= curryearSept) {
        YrMthNPTs.push('"' + "September" + '"', '"' + "August" + '"', '"' + "July" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;
        if (Augcnt > 30) Augcnt = 15;
        if (Sepcnt > 30) Sepcnt = 15;

        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt + Maycnt + Juncnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Sepcnt);
        NpthrsCn.push(Augcnt);
        NpthrsCn.push(Julcnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is October?
    if (var_today > curryearSept && var_today <= curryearOct) {
        YrMthNPTs.push('"' + "October" + '"', '"' + "September" + '"', '"' + "August" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;
        if (Augcnt > 30) Augcnt = 15;
        if (Sepcnt > 30) Sepcnt = 15;
        if (Octcnt > 30) Octcnt = 15;

        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt + Maycnt + Juncnt + Julcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Octcnt);
        NpthrsCn.push(Sepcnt);
        NpthrsCn.push(Augcnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is November?
    if (var_today > curryearOct && var_today <= curryearNov) {
        YrMthNPTs.push('"' + "November" + '"', '"' + "October" + '"', '"' + "September" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;
        if (Augcnt > 30) Augcnt = 15;
        if (Sepcnt > 30) Sepcnt = 15;
        if (Octcnt > 30) Octcnt = 15;
        if (Novcnt > 30) Novcnt = 15;

        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt + Maycnt + Juncnt + Julcnt + Augcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Novcnt);
        NpthrsCn.push(Octcnt);
        NpthrsCn.push(Sepcnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }

    // Is December?
    if (var_today > curryearNov && var_today <= curryearDec) {
        YrMthNPTs.push('"' + "December" + '"', '"' + "November" + '"', '"' + "October" + '"', '"' + "Acc Current year" + '"', '"' + "Last Year" + '"'); // X axis.

        // Normalize counter's scale.
        if (lastYcnt > 30) lastYcnt = 15;
        if (Jancnt > 30) Jancnt = 15;
        if (Febcnt > 30) Febcnt = 15;
        if (Marcnt > 30) Marcnt = 15;
        if (Aprcnt > 30) Aprcnt = 15;
        if (Maycnt > 30) Maycnt = 15;
        if (Juncnt > 30) Juncnt = 15;
        if (Julcnt > 30) Julcnt = 15;
        if (Augcnt > 30) Augcnt = 15;
        if (Sepcnt > 30) Sepcnt = 15;
        if (Octcnt > 30) Octcnt = 15;
        if (Novcnt > 30) Novcnt = 15;
        if (Deccnt > 30) Deccnt = 15;

        currYcnt = Jancnt + Febcnt + Marcnt + Aprcnt + Maycnt + Juncnt + Julcnt + Augcnt + Sepcnt;
        if (currYcnt > 30) currYcnt = 15;

        NpthrsCn.push(Deccnt);
        NpthrsCn.push(Novcnt);
        NpthrsCn.push(Octcnt);
        NpthrsCn.push(currYcnt);
        NpthrsCn.push(lastYcnt); // Y axis.
    }


    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("x axis: " + YrMthNPTs);
    rbv_api.println("y axis: " + NpthrsCn);
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
}



/* -------------------------------------------------------------------------- *
 *          COLLECT DATA FOR QVIEW/# of Events By Job chart                   *
 *                                                                            *
 * NOTE: This chart contemplate only Events created during last three months. *
 * -------------------------------------------------------------------------- */
var CollJobNr = []; // X axis: Jobs.
var CollEvnBj = []; // Y axis: # of Events by Job.

if (I.length > 0) {
    var currentJbId = I[0][5]; // Start with the first Job's id (from the GROUP BY SELECT).
    var currentJbNm = I[0][4]; // Start with the first Job's name  (from the GROUP BY SELECT).
    var eventsCnt = 0; // Events counter (this variable is re-started when a control break occurs in the GROUP BY SELECT).
    var one_day = 1000 * 60 * 60 * 24; // One day in milliseconds.
    var var_today = new Date().getTime(); // Today in milliseconds.
    var var_threeM = var_today - (one_day * 91); // Calculate today in milliseconds minus 3 months in milliseconds.


    // Iterate through Events list.
    for (var i_Ev = 0; i_Ev < I.length; i_Ev++) {
        var EvName = I[i_Ev][1]; // Get Event's name.
        var EvJobId = I[i_Ev][5]; // Get Job's id.
        var EvJobNr = I[i_Ev][4]; // Get Job's number.
        var EvDateC = I[i_Ev][3]; // Get Event's Date of creation.


        // Include only Events created during last three months.
        if (EvDateC.getTime() >= var_threeM && EvDateC.getTime() <= var_today) {

            // Compare current Job's id against last Job's id. If different then register the Job's event name.
            if (Number(EvJobId) === Number(currentJbId)) {
                eventsCnt++;
            } else {
                CollJobNr.push('"' + currentJbNm.toString() + '"');
                currentJbNm = EvJobNr;
                currentJbId = EvJobId;

                CollEvnBj.push(eventsCnt);
                eventsCnt = 1;
            }
        }
    }

    CollJobNr.push('"' + EvJobNr.toString() + '"');
    CollEvnBj.push(eventsCnt);


    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    for (var j = 0; j < CollJobNr.length; j++) {
        rbv_api.println("# of Events for Job: " + CollJobNr[j] + " are " + CollEvnBj[j]);
    }
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
}




/* -------------------------------------------------------------------------- *
 *          COLLECT DATA FOR QVIEW/# of Jobs By Location chart                *
 *                                                                            *
 * NOTE: This chart contemplate only Jobs created during last three months. *
 * -------------------------------------------------------------------------- */
var CollLocat = []; // X axis: Locations.
var CollJobLc = []; // Y axis: # of Jobs by Location.

if (J.length > 0) {
    var currentLcId = J[0][2]; // Start with the first Location's id (from the GROUP BY SELECT).
    var currentLcNm = J[0][3]; // Start with the first Location's name  (from the GROUP BY SELECT).
    var JobsLcCnt = 0; // Jobs counter (this variable is re-started when a control break occurs in the GROUP BY SELECT).
    var one_day = 1000 * 60 * 60 * 24; // One day in milliseconds.
    var var_today = new Date().getTime(); // Today in milliseconds.
    var var_threeM = var_today - (one_day * 91); // Calculate today in milliseconds minus 3 months in milliseconds.


    // Iterate through Jobs list.
    for (var i_Jl = 0; i_Jl < J.length; i_Jl++) {
        var JbId = J[i_Jl][0]; // Get Job's id.
        var JbName = J[i_Jl][1]; // Get Job's name.
        var JobLcId = J[i_Jl][2]; // Get Location's id.
        var JobLcNr = J[i_Jl][4]; // Get Location's name or number.
        var JbDateC = J[i_Jl][5]; // Get Job's Date of creation.
        // var locTest = rbv_api.getRelatedIds("R1665668", JbId); // Get Job's Location.


        // rbv_api.println("Current Job name: " + JbName + " is from Location number: " + locTest[0]);

        // Include only Jobs created during last three months.
        if (JbDateC.getTime() >= var_threeM && JbDateC.getTime() <= var_today) {

            // rbv_api.println("Current Event name: " + EvName + " is within three months period");
            // rbv_api.println("Current Job's id: " + Number(EvJobId) + " and last Job's id: " + Number(currentJbId));

            // Compare current Location's id against last Location's id. If different then increment Job counter.
            if (Number(JobLcId) === Number(currentLcId)) {
                JobsLcCnt++;
                // rbv_api.println("JOB's IDs ARE EQUAL! THEN COUNT and event counter is = " + eventsCnt);
            } else {
                CollLocat.push('"' + currentLcNm.toString() + '"');
                currentLcNm = JobLcNr;
                currentLcId = JobLcId;

                CollJobLc.push(JobsLcCnt);
                JobsLcCnt = 1;
                // rbv_api.println("JOB's IDs ARE DIFFERENT! THEN BREAK and event counter is = " + eventsCnt);
            }
        }
    }

    CollLocat.push('"' + JobLcNr.toString() + '"');
    CollJobLc.push(JobsLcCnt);


    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    for (var j = 0; j < CollLocat.length; j++) {
        rbv_api.println("# of Jobs for Location: " + CollLocat[j] + " are " + CollJobLc[j]);
    }
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
}




/* ------------------------------------------------------------------------------------- *
 *        COLLECT DATA FOR QVIEW/Calibration status By MDE Type chart                    *
 *                                                                                       * 
 * NOTE: This chart shows a three segment (colored) bar for each MDE Type and for one    *
 *       specific Service Line. The three segments are:                                  *
 *                                                                                       *
 *              - Blue for "MDE Needs Calibration"                                       *
 *              - Green for "MDE Usable"                                                 *
 *              - Red for "MDE Expired"                                                  *
 * ------------------------------------------------------------------------------------- */
var mdeTypes = []; // X axis: MDE Types (for one specific Service Line).
var needsCalCnt = []; // Y axis: counters for each "MDE Needs Calibration" segment.
var usableCnt = []; //         counters for each "MDE Usable" segment.
var expiredCnt = []; //         counters for each "MDE Expired" segment.


if (K.length > 0 && L.length > 0) {
    // var K = rbv_api.selectQuery("SELECT MDE_Type_READ_ONLY FROM MDE_Type ORDER BY MDE_Type_READ_ONLY", 999);
    // var L = rbv_api.selectQuery("SELECT id, Days_Expired_INT, Type_READ_ONLY FROM MDE ORDER BY Type_READ_ONLY", 999);

    // Fill the MDE Types (X axis) vector.
    for (var i_Ml = 0; i_Ml < K.length; i_Ml++) {
        mdeTypes[i_Ml] = K[i_Ml][0];
    }


    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
    for (var j = 0; j < mdeTypes.length; j++) {
        rbv_api.println("MDE Type: " + mdeTypes[j]);
    }
    rbv_api.println("");
    rbv_api.println("");
    rbv_api.println("");
}





var serviceLine = [];
var assetCounter = [];
var asset = [];


for (var i = 0; i < C.length; i++) {

    var str = C[i][0].toString();
    var assets = rbv_api.getRelatedIds("R255710", str);
    if (assets.length > 0) {
        assetCounter.push(assets.length);
        serviceLine.push('"' + C[i][1].toString() + '"');
    }
}

for (var i = 0; i < E.length; i++) {
    var asset_type_id = E[i][0].toString();
    var asset_type = rbv_api.getRelatedIds("R150777", asset_type_id);
    if (asset_type.length > 0) {
        asset.push('{"name":' + '"' + E[i][1] + '"' + ',"sum":' + asset_type.length + '}');
    }

}

//var x = ["Valid","15 days","30 days","45 days","Expired","Need Calibratiom"];
var x = [];
x.push('"' + "Valid" + '"', '"' + "15 days" + '"', '"' + "30 days" + '"', '"' + "45 days" + '"', '"' + "Expired" + '"', '"' + "Need Calibratiom" + '"');

//var y = [0,0,0,0,0,0];
var y = [];
y[0] = 0.0;
y[1] = 0.0;
y[2] = 0.0;
y[3] = 0.0;
y[4] = 0.0;
y[5] = 0.0;

for (var i = 0; i < F.length; i++) {
    if (F[i][1] === null) {
        y[5] = y[5] + 1;
        continue;
    }
    if (F[i][1] === 0) {
        y[0] = y[0] + 1;
        continue;
    }


    if (F[i][1] < 15) {
        y[1] = y[1] + 1;
        continue;
    }
    if (F[i][1] < 30) {
        y[2] = y[2] + 1;
        continue;
    }
    if (F[i][1] < 45) {
        y[3] = y[3] + 1;
        continue;
    }
    y[4] = y[4] + 1;

}
//Temporal
if (y[5] > 10) {
    y[5] = 10;
}

// Original JSON string - Date: 21/03/2018.
// var json = '{"data":{"calibration":{"x":[' + x + '],"y":[' + y + ']},"serviceLines":[' + serviceLine + '],"assets":[' + assetCounter + '],"jobs":' + D.length + ',"asset_type":' + '[' + asset + ']' + '}}';

// JSON string - Date: 02/04/2018.
// var json = '{"data":{"calibration":{"x":[' + x + '],"y":[' + y + ']},"serviceLines":[' + serviceLine + '],"assets":[' + assetCounter + '],"jobs":' + D.length + ',"asset_type":' + '[' + asset + ']' + ',"JobsByServiceL":{"xSl":[' + CollservL + '],"yJn":[' + CollJobCn + ']}' + '}}';

// JSON string - Date: 04/04/2018.
// var json = '{"data":{"calibration":{"x":[' + x + '],"y":[' + y + ']},"serviceLines":[' + serviceLine + '],"assets":[' + assetCounter + '],"jobs":' + D.length + ',"asset_type":' + '[' + asset + ']' + ',"JobsByServiceL":{"xSl":[' + CollservL + '],"yJn":[' + CollJobCn + ']}' + ',"NPTsByNptType":{"xNl":[' + CollNptTp + '],"yN1":[' + CollNptCn + ']}' + '}}';

// JSON string - Date: 13/04/2018.
// var json = '{"data":{"calibration":{"x":[' + x + '],"y":[' + y + ']},"serviceLines":[' + serviceLine + '],"assets":[' + assetCounter + '],"jobs":' + D.length + ',"asset_type":' + '[' + asset + ']' + ',"JobsByServiceL":{"xSl":[' + CollservL + '],"yJn":[' + CollJobCn + ']}' + ',"NPTsByNptType":{"xNl":[' + CollNptTp + '],"yN1":[' + CollNptCn + ']}' + ',"NPTHrByPeriod":{"xN2":[' + YrMthNPTs + '],"yN2":[' + NpthrsCn + ']}' + '}}';

var json = '{"data":{"calibration":{"x":[' + x + '],"y":[' + y + ']},"serviceLines":[' + serviceLine + '],"assets":[' + assetCounter + '],"jobs":' + D.length + ',"asset_type":' + '[' + asset + ']' + ',"JobsByServiceL":{"xSl":[' + CollservL + '],"yJn":[' + CollJobCn + ']}' + ',"NPTsByNptType":{"xNl":[' + CollNptTp + '],"yN1":[' + CollNptCn + ']}' + ',"NPTHrByPeriod":{"xN2":[' + YrMthNPTs + '],"yN2":[' + NpthrsCn + ']}' + ',"EventsByJob":{"xN3":[' + CollJobNr + '],"yN3":[' + CollEvnBj + ']}' + ',"JobsByLoc":{"xN4":[' + CollLocat + '],"yN4":[' + CollJobLc + ']}' + '}}';

rbv_api.println(x);
rbv_api.println(y);
rbv_api.setFieldValue("DummyTest", "{!id}", "json", json);
rbv_api.setTextFieldValue("DummyTest", {!id }, "File_Upload_Test", json, "application/octet-stream", "dashboard.json");
rbv_api.println("{!File_Upload_Test#url}");