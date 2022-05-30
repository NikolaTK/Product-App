var eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `    
    <div class="product">
        <div class="product-image">
            <img v-bind:src="image">
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description}}</p>

            <div v-for="(variant, index) in variants" 
                :key="variant.variantId"
                class="color-box"
                :style="{ backgroundColor: variant.variantColor }"
                @mouseover="updateProduct(index)">
            </div>
            
            <p>{{ sale }}</p>

            <div v-for="element in sizes" :key="sizes.sizeId">
                <p>{{ element.size }}</p>
            </div>

            <p v-show="onSale">On Sale!</p>
            <p v-if="inStock">In Stock</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
            
            <info-tabs :shipping="shipping" :details="details"></info-tabs>
            
            <a :href="link" target="_blank">More products like this</a>
            <br>
            <button v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }">Add to Cart</button>
            <button v-on:click="removeFromCart">Remove from Cart</button>
        </div>

        <product-tabs :reviews="reviews"></product-tabs>
    </div>
    `,    
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            description: 'A pair of warm, fuzzy socks',
            selectedVariant : 0,
            onSale: false,
            link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
            details:["80% cotton", "20% polyester", "Gender-neutral"],
            variants:[
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: './assets/vmSocks-green.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: './assets/vmSocks-blue.jpg',
                    variantQuantity: 0
                }
            ],
            sizes:[
                {
                    sizeId: 1,
                    size: 'Small'
                },
                {
                    sizeId: 2,
                    size: 'Medium'
                },
                {
                    sizeId: 3,
                    size: 'Large'
                }
            ],
            reviews: []
        }
    },

    methods: {
        addToCart: function() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },

        updateProduct: function(index) {
            this.selectedVariant = index
            console.log(index)
        },

        removeFromCart: function() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        }
    },
    computed:{
        title() {
            return this.brand + ' ' + this.product
        },

        image() {
            return this.variants[this.selectedVariant].variantImage
        },

        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },

        sale() {
            if( this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!'
            } else {
                return this.brand + ' ' + this.product + ' are not on sale!'
            }
        },

        shipping() {
            if (this.premium) {
                return "Free"
            }
            return "2.99"
        },

        mounted() {
            eventBus.$on('review-submitted', productReview => {
                this.reviews.push(productReview)
            })
        }
    }
})

Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab">
                {{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">

            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>
      
             <p>
                <label for="review">Review:</label>      
                <textarea id="review" v-model="review"></textarea>
            </p>
      
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
          
            <p>
                <input type="submit" value="Submit">  
            </p>    
            <p>Would you recommend this product?</p>
            <label>
                Yes
                <input type="radio" value="Yes" v-model="recommend"/>
            </label>
            <label>
                No
                <input type="radio" value="No" v-model="recommend"/>
            </label>

            <p>
              <input type="submit" value="Submit">  
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            rating: null,
            review: null,
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                            let productReview = {
                name : this.name,
                rating : this.rating,
                review : this.review,
                recommend: this.recommend
                }
            eventBus.$emit('review-submitted', productReview)
            this.name = null
            this.rating = null
            this.review = null
            this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required!")
                if(!this.review) this.errors.push("Review required!")
                if(!this.rating) this.errors.push("Rating required!")
                if(!this.recommend) this.errors.push("Recommendation required!")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                    :class="{ activeTab: selectedTab === tab}"
                    v-for="(tab, index) in tabs"
                    :key="index"
                    @click="selectedTab = tab">
                    {{ tab }}</span>

            <div>
            <h2>Reviews</h2>
            <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet!</p>
            <ul>
                <li v-for="review in reviews">
                <p>{{ review.name }}</p>
                <p>Rating: {{ review.rating }}</p>
                <p>{{ review.review }}</p>
                </li>
            </ul>
            </div>
        </div>

        <product-review v-show="selectedTab === 'Make a Review'"></product-review>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: false,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },

        removeFromCart(id) {
            this.cart.pop(id)
        }
    }
})