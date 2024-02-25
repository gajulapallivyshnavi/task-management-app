const express=require("express")
const mongoose=require("mongoose")
const port=3069
const app=express()
app.use(express.json())
const {Schema,model}=mongoose //object destructuring
const {checkSchema,validationResult}=require("express-validator")

//connecting to database
mongoose.connect("mongodb://127.0.0.1:27017/task-app")
.then(()=>{
    console.log("succesfully connected to db")
})
.catch((err)=>{
    console.log("error connecting to db",err)
})

//creating Schema and model
const taskSchema=new Schema({
    title:String,
    description:String,
    status:String
},{timeStamps:true})

const Task=model("Task",taskSchema)

//creating a validation schema for server side validations
const taskValidationSchema={
   title:{
    in:["body"],
    exists:{
        errorMessage:"title is required"
    },
    notEmpty:{
        errorMessage:"title cannot be Empty"
    },isLength:{
        options:{min:3},
        errorMessage:"title should be min of 3 char"
    },
    custom:{
        options:function (value){
            return Task.findOne({title:value})
            .then((task)=>{
                if(!task){
                    return true
                }
                throw new Error("title already taken")
            })
            
        }
    }


},
description:{
    in:["body"],
    exists:{
        errorMessage:"description is required"
    },
    notEmpty:{
        errormessage:"descripyion cannot be empty"
        
    }
},
status:{
    in:["body"],
    exists:{
        errorMessage:"status is required"
    },
    notEmpty:{
        errorMessage:"status cannot be empty"
    },
    isIn:{
        options:[["pending","in progress","completed"]],
        errorMessage:"status should be one of(pending,in progress,completed)"
    }
}
}

//craeting idValidationSchema
const idValidationSchema={
    id:{
        in:["params"],
        isMongoId:{
            errorMessage:"should be a valid mongodb id"
        }
    }
}

//creating taskupdatevalidationSchema
const taskUpdateValildationSchema={
    title:{
        in:["body"],
        exists:{
            errorMessage:"title is required"
        },
        notEmpty:{
            errorMessage:"title cannot be Empty"
        },isLength:{
            options:{min:3},
            errorMessage:"title should be min of 3 char"
        }
},description:{
    in:["body"],
    exists:{
        errorMessage:"description is required"
    },
    notEmpty:{
        errormessage:"descripyion cannot be empty"
        
    }
},
status:{
    in:["body"],
    exists:{
        errorMessage:"status is required"
    },
    notEmpty:{
        errorMessage:"status cannot be empty"
    },
    isIn:{
        options:[["pending","in progress","completed"]],
        errorMessage:"status should be one of(pending,in progress,completed)"
    }
}
}


//creating request handlers

app.post("/tasks",checkSchema(taskValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body=req.body
    Task.create(body)
    .then((task)=>{
        res.json(task)
    })
    .catch((err)=>{
        res.json(err)
    })
})

app.get("/tasks",(req,res)=>{
    Task.find()
    .then((task)=>{
        res.json(task)
    })
    .catch((err)=>{
        res.json(err)
    })
})

app.get("/tasks/:id",checkSchema(idValidationSchema),(req,res)=>{
  const errors=validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
  }
  const id=req.params.id
  Task.findById(id)
  .then((task)=>{
    if(!task){
     res.status(404).json({})
    }
    res.json(task)
  })
  .catch((err)=>{
    res.status(500).json({error:"internal server error"})
  })
})

app.put("/tasks/:id",checkSchema(taskUpdateValildationSchema),checkSchema(idValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id=req.params.id
    const body=req.body
    Task.findByIdAndUpdate(id,body,{new:true})
    .then((task)=>{
        if(!task){
            res.status(404).json({})
        }
        res.json(task)

    })
    .catch((err)=>{
            res.status(500).json({error:"internal server error"})
    })
})


app.delete("/tasks/:id",checkSchema(idValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id=req.params.id
    Task.findByIdAndDelete(id)
    .then((task)=>{
        if(!task)
        {
            res.status(404).json({})
        }
        res.json(task)  
    })
    .catch((err)=>{
          res.status(500).json({error:"internal server error"})
    })
})



app.listen(port,()=>{
    console.log("server running successfully on port",port)
})