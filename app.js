//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongo_user = process.env.MONGO_USERNAME;
const mongo_psswd = process.env.MONGO_PASSWORD;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//using DB
mongoose.connect("mongodb+srv://" + mongo_user + ":" + mongo_psswd + "@cluster0.dqozfm5.mongodb.net/todoListDB")

const todoItemSchema = new mongoose.Schema({
  name: String
})

const ToDoItem = mongoose.model("ToDoItem", todoItemSchema)

const cleanApartment = new ToDoItem({
  name: "Clean Apartment"
})

const doLaundry = new ToDoItem({
  name: "Do Laundry"
})

const defaultItems = [cleanApartment, doLaundry];

const listSchema = new mongoose.Schema({
  name: String,
  items: [todoItemSchema]
})

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  ToDoItem.find({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        ToDoItem.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Success");
          }
        })
        res.redirect("/")
      } else {
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const itemToSave = new ToDoItem({
    name: itemName
  })

  const listName = req.body.list;

  if (listName === "Today") {
    itemToSave.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(itemToSave)
      foundList.save()
      res.redirect("/" + listName)
    })
  }


});


app.post("/delete", function(req, res) {
  const itemIdDelete = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    ToDoItem.findByIdAndRemove(itemIdDelete, function(err){
      if (!err) {
        res.redirect("/")
      }
    })

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemIdDelete}}}, function (err, result){
      if(!err) {
        res.redirect("/" + listName)
      }
    })
  }
})

app.get("/:customList", function(req, res) {
  const listName = req.params.customList;

  List.findOne({name: listName}, function(err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: listName,
          items: defaultItems
        })

        list.save()
        res.redirect("/" + listName)
      } else {
        res.render("list", {listTitle: listName, newListItems: result.items});
      }
    } else {
      console.log(err);
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
