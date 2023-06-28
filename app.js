const express = require('express');
const { google } = require('googleapis');
const credentials = require('./ptk.json'); // Path to your credentials JSON file
const open = require('openurl');
const app = express();
const pool = require('./db');
const writeToGoogleSpreadsheet = require('./script');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home page route
app.get('/', (req, res) => {
  res.render('home');
});

// Login form submission route
app.post('/login', (req, res) => {
  const { userId, password } = req.body;
//   console.log(req.body)
    const sqlQuery = "Select * from User where name='"+userId+"' and password='"+password+"'"
    // console.log(sqlQuery)
    pool.query(sqlQuery, (err, result) => {
        console.log("error", err)
        // console.log("result", result)
        if(Object.keys(result).length > 0){
            if(result[0]["id"] === "admin"){
                console.log("This is running...", result)
                res.redirect('/dashboard');
            }
            else{
                res.render('customer', { result });
            }
        }
        else{ 
            res.render('home', { result });
        }
    })

});


// Change Passsword:
app.get('/changePasswordpage', (req, res) => {
    res.render('change_password');
});

app.post('/changePassword', (req, res) => {
    const { phoneNumber, newPassword, confirmPassword } = req.body;

    if(newPassword !== confirmPassword){
        const text = [ {id: "Password Not Matched"} ]
        res.render('change_password', { text });
        return;
    }

    const query = "Select * from User where phone_number = '"+ phoneNumber + "'";
    pool.query(query, (err, result) => {
        console.log("Error", err);
        console.log("Runningggggggg.......")
        if(result.length < 1){
            const text = [ {id: "No registered Phone Number in the database"} ]
            res.render('change_password', { text });
        }
        else{
            console.log("number, password, confirmPassword  ",phoneNumber, newPassword, confirmPassword )
            const query2 = "Update User SET password = '"+ newPassword +"' where phone_number = '"+ phoneNumber + "'";
            pool.query(query2, (err2, result2) => {
                console.log("Error", err2);
                console.log("Result", result2);
                res.render('home');
            })
        }
    })
    
    // pool.query(query2, (err, result) => {
    //     console.log("Error", err);
    //     console.log("Result", result);
    //     res.render('home');
    // })

});

// Dashboard page route
app.post('/dashboard', (req, res) => {
  // Fetch user data from the database and pass it to the dashboard view
  // You can query the database using the MySQL connection pool
    let { orderIDbtn, orderNamebtn } = req.body;
    orderIDbtn = orderIDbtn.trim();
    console.log(req.body);
    let sqlQuery = "Select * from OrderItem where user_id = "+ orderIDbtn;
    pool.query(sqlQuery, (err, result) => {
        console.log("Error in getting orderIDbtn", err);
        // console.log(result);
    ///////////////////////////////////////////////////////////////////////////////////////////
        let ownerName = [ { id: orderIDbtn ,name: orderNamebtn } ];
        if(result.length < 1){
            let mergeQuery = "SELECT OrderItem.*, COALESCE(User.name, 'null') AS name FROM OrderItem LEFT JOIN User ON User.id = OrderItem.user_id;"
            pool.query( mergeQuery , (err2, result2) => {
                console.log("Error...... 2",err2);
                result = result2;
              let val = ' {"id":"Id","orderListId":"OrderListID","productId":"productId","package":"package","request_weight":"request_weight","result_weight":"result_weight","orderDate":"orderDate","price":"price","order_id":"order_id", "count" : "Count", "requests": "Request",  "user_id" : "User Id", "create_time" :"Creation Time", "name" : "Name" }, ';
              let orderIDbtn = JSON.stringify(result);
              let newString = orderIDbtn.slice(0, 1) + val + orderIDbtn.slice(1);
              console.log("This is new String: ",newString);
              writeToGoogleSpreadsheet(JSON.parse(newString));
              console.log("Result 2",result2);
                console.log("result 1",result);
                res.render('dashboard', { result });
                return;
            })
        }
        // console.log("The result: ",result);
        else{
            let val = ' {"id":"Id","orderListId":"OrderListID","productId":"productId","package":"package","request_weight":"request_weight","result_weight":"result_weight","orderDate":"orderDate","price":"price","order_id":"order_id", "count" : "Count", "requests": "Request",  "user_id" : "User Id", "create_time" :"Creation Time", "name" : "Name" }, ';
              let orderIDbtn = JSON.stringify(result);
              let newString = orderIDbtn.slice(0, 1) + val + orderIDbtn.slice(1);
              console.log("This is new String: ",newString);
              writeToGoogleSpreadsheet(JSON.parse(newString));
            res.render('dashboard', { result, ownerName });
        }

    ///////////////////////////////////////////////////////////////////////////////////////////

        

    });

});


app.post('/submit', (req, res) =>{
    const { order_date, company, owner, item, quantity, weight, request_for_ship,request_for_ship_real} = req.body;
    
    
    // Not include: Count, 
    const checkProAva = "Select * from ProductInfo where species = '"+ item +"'";
    pool.query(checkProAva, (err3, result3) => {
        if(result3.length < 1){
            const avaPackage = "Select species from ProductInfo";
            pool.query(avaPackage, (err2, result2) => {
                console.log("Result2.......",result2);
                let arr = [];
                for(let i=0; i<result2.length; i++){
                    arr.push(result2[i]["species"]);
                }
                let text = [ {id : "No Available package, following packages are available in Product table ", species: arr } ];
                let result = [ {id: company, name: owner } ]
                console.log("Text....", text);
                res.render('customer', { result, text });
            });
        }
        else{
            const getPID = "SELECT `Order`.id AS order_id, ProductInfo.id AS product_id FROM `Order` JOIN ProductInfo ON `Order`.user_id = "+company+" AND ProductInfo.species = '"+item+"'";
            pool.query(getPID, (err2, result2) =>{
                const order_id = result2[0]["order_id"];
                const product_id = result2[0]["product_id"];
                const sqlQuery = "INSERT INTO OrderItem(user_id, productId, orderDate, package,  result_weight, request_weight, order_id, count, requests, create_time) VALUES ("+ company +", "+ product_id+", '"+order_date+"','"+item+"',"+weight+","+request_for_ship+", "+ order_id+", "+ quantity+", '" + request_for_ship_real + "', NOW() )"
                console.log("SQL QUERY...", sqlQuery);
                pool.query(sqlQuery, (err4, result4) => {
                    console.log("Error4....", err4);
                    console.log("Result4....", result4);
                    let text2 = [ {id: "Product ordered successfully"} ]
                    let result = [ {id: company, name: owner } ]
                    console.log(text2);
                    res.render('customer', { result, text2 } );
                });

            });
        }
    })
    // console.log(sqlQuery);
    // pool.query(sqlQuery, (err, result) => {
    //     console.log(sqlQuery);
    //     console.log("error", err)
    //     console.log("result successfull", result)
    // })
    // let result = [{id : company, name: owner}];
    // res.render('customer', { result });
});

// app.post("/gotoexcel", (req, res) =>{
//     console.log("Goto excel button",req.body);
//     const { orderIDbtn } = req.body;
//     let val = ' {"id":"Id","orderListId":"OrderListID","productId":"productId","package":"package","request_weight":"request_weight","result_weight":"result_weight","orderDate":"orderDate","price":"price","order_id":"order_id", "count" : "Count", "requests": "Request",  "user_id" : "User Id", "create_time" :"Creation Time", "name" : "Name" }, ';
//     let newString = orderIDbtn.slice(0, 2) + val + orderIDbtn.slice(2);
//     console.log("New strin\n",(newString));
//     console.log("New strin\n",JSON.parse(newString));

//     writeToGoogleSpreadsheet(JSON.parse(newString));
//     let redirectUrl = 'https://docs.google.com/spreadsheets/d/1tsEgKRtHfZaYo13uoWNF89HIvL14Pt-01X1R69QGVMc';
//     // res.redirect(redirectUrl);
//     const linkHtml = `<a href="${redirectUrl}" target="_blank">Open Website in New Tab</a>`;
//     res.send(linkHtml);
//     let text = [ {id: "Redirected to spreedsheet"} ]
//     res.render("home", { text });
// })

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
