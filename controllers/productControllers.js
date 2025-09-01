import Product from "../models/product.js";
import { isAdmin } from "./userControllers.js";

//Create Product

export async function createProduct(req,res){
  if(!isAdmin(req)) {
    return res.status(403).json(
      {
        message : "Access denied.Admin Only."
      }
    )
  }
  const product = new Product(req.body);
  
  try{
    const responses = await product.save();

    res.json({
      message : "Product Create Successfully",
      product : responses,
    });
  }catch(error){
    console.error("Error creating product:,error");
    return res.status(500).json(
      {
        message : "Failed to create product"
      }
    )
  }
}


//Get Product

export async function getProducts(req,res){
  console.log("Fetching Product")
  try{
    if(isAdmin(req)){
      const products = await Product.find();
      return res.json(products);
    }else{
      const products = await Product.find({isAvailable : true});
      return res.json(products);
  }
}catch(error){
  console.error("Error fetching products:",error);
  return res.status(500).json(
    {
      message : "Failed to fetch products"
    }
  )
}
}

//Update Product

export async function updateProduct(req,res){
  if (!isAdmin(req)){
    res.status(403).json(
      {
        message : "Access denied. Admins Only"
      }
    )
    return;
  }

  const data = req.body;
  const productId = req.params.productId;
  data.productId = productId;

  try{
    await Product.updateOne(
      {
        productId : productId
      },
      data
    );
    res.json(
      {
        message : "Product Updated Successfully"
      }
    );
  }catch(error) {
    console.error("Error update product:",error);
    res.status(500).json(
      {
        message : "Failed to update product"
      }
    );
    return;
  }
}

// Delete product

export async function deleteProduct(req,res){
  if(!isAdmin(req)){
    res.status(403).json(
      {
        message : "Access denied. Admin Only."
      }
    );
    return;
  }

  try{
    const productId = req.params.productId;

    await Product.deleteOne({
      productId : productId,
    });

    res.json(
      {
        message : "Product Deleted Successfully"
      }
    );

  }catch(error){
    console.error("Error deleting product:",error);
    res.status(500).json(
      {
        message : "Failed to delete product"
      }
    );
    return;
  }
}


export async function getProductInfo(req,res){
  try{
    const productId = req.params.productId;
    const product = await Product.findOne({productId : productId}) 

    if(product==null){
      res.status(404).json(
        {
          message : "Product not found"
        }
      )
      return;
    }

    if(isAdmin(req)){
      res.json(product);
      
    }else{
      if(product.isAvailable){
        res.json(product)
      }else{
        res.status(404).json(
          {
            message : "Product is not available"
          }
        )
        return;
      }

  }
}catch(error){
  console.error("Error fetching product",error);
  res.status(500).json(
    {
      message : "Failed to fetch product"

    }
  )
  return;
}

}


export async function searchProducts(req,res){
  const query = req.params.query;

  try{
    const products = await Product.find({

      $or : [

         {name : { $regex : query, $options : "i"}},
         {altNames : {$elemMatch : { $regex : query, $options : "i"}}},

      ],
      isAvailable : true,
    })
    res.json(products);
    
    } catch(error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
}

}