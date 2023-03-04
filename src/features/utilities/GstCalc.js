export const getGst = (hsn, unit_cost) => {
    const gst18 = [4202, 3304, 9404, 3401, 9503, 420231, 6507, 6505, 3926, 9505, 4909, 4820, 9506, 9405, 3924, 9995, 6217];
    const gst12 = [810, 6211, 6214, 6203, 6103, 6205, 6105, 6104, 6204, 6108, 6208, 6206, 6106, 6109, 6111, 6209, 9404, 6304, 3406, 6302, 5702, 4421, 6912];
    const gst5 = [6211, 5208, 6214, 6203, 6103, 6205, 6104, 6204, 6108, 6208, 6206, 6106, 6109, 6111, 6209, 9404, 901, 904, 906, 907, 908, 909, 910, 409, 1207, 6505];
    const gst3 = [7117];
    const gst0 = [];

    let gst18_valid = 0;
    let gst12_valid = 0;
    let gst5_valid = 0;
    let gst3_valid = 0;
    let gst0_valid = 0;
    let lt1050 = 1;

    if (unit_cost >= 1120) { lt1050 = 0; }

    for (let i = 0, iLen = gst0.length; i < iLen; i++) {
        if (gst0[i] === hsn) {
            gst0_valid = 1; break;
        }
    }

    for (let i = 0, iLen = gst3.length; i < iLen; i++) {
        if (gst3[i] === hsn) {
            gst3_valid = 1; break;
        }
    }

    for (let i = 0, iLen = gst5.length; i < iLen; i++) {
        if (gst5[i] === hsn) {
            gst5_valid = 1; break;
        }
    }

    for (let i = 0, iLen = gst12.length; i < iLen; i++) {
        if (gst12[i] === hsn) {
            gst12_valid = 1; break;
        }
    }

    for (let i = 0, iLen = gst18.length; i < iLen; i++) {
        if (gst18[i] === hsn) {
            gst18_valid = 1; break;
        }
    }

    //Browser.msgBox("GST5: " + gst5_valid + "\\nGST12: " + gst12_valid + "\\nGST18: " + gst18_valid + "\\n\\nLT1050: " + lt1050 );

    if (gst0_valid) { return 0; }
    if (gst3_valid) { return 3; }
    else if (lt1050 && gst5_valid) { return 5; }
    else if (!lt1050 && gst12_valid) { return 12; }
    else if (gst5_valid) { return 5; }
    else if (gst12_valid) { return 12; }
    else if (gst18_valid) { return 18; }
    else { return "Failed"; }
}