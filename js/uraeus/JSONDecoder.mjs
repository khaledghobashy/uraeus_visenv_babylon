import {scene, followCamera, focusTarget, camera} from './main.mjs'
import {Cylinder_Geometry, Sphere_Geometry, Triangular_Prism, Composite_Geometry} from './GeometriesObjects.mjs'
import {Mirrored, Centered} from './vectorOperations.mjs'

// A model class that holds the constructed geometric objects
class Model
{
    constructor(name)
    {
        this.name = name;
        this.subsystem_name = name;
        this.mesh = new BABYLON.Mesh(name, scene);
    }
}

// Creating a container that stores all the needed constructors that can
// handle the inputs aquired from the parsed JSON file
var Constructors = 
{
    Cylinder_Geometry: function(name, args)
    {
        const geo = new Cylinder_Geometry(name);
        const [p1, p2, radius] = args;
        geo.construct(p1, p2, radius);
        return geo
    },

    Sphere_Geometry: function(name, args)
    {
        const geo = new Sphere_Geometry(name);
        const [p1, radius] = args;
        geo.construct(p1, radius);
        return geo
    },

    Triangular_Prism: function(name, args)
    {
        const geo = new Triangular_Prism(name);
        const [p1, p2, p3, thickness] = args;
        geo.construct(p1, p2, p3, thickness);
        return geo
    },

    Composite_Geometry: function(name, args)
    {
        const geo = new Composite_Geometry(name);
        const meshes = [];
        for (const i in args) {meshes.push(args[i].mesh)};
        geo.construct(meshes);
        return geo
    },

    Mirrored: function(name, args)
    {
        const vec = Mirrored(args[0]);
        return vec
    },

    Centered: function(name, args)
    {
        const vec = Centered(args[0], args[1]);
        return vec
    }
};

export class ConfigurationDecoder
{
    constructor(configFileData)
    {
        this.jsonObject = JSON.parse(configFileData);
        console.log(this.jsonObject);
        const name = this.jsonObject.information.subsystem_name;
        console.log(name);
        this.model = new Model(name);
    };

    constructModel()
    {
        this.construct_points();
        this.construct_geometries();
        this.constructGeometriesMap();
        //this.makePickable();
        this.setGeometriesParent();
        return this.model
    };

    constructGeometriesMap()
    {
        var geometries_map = this.jsonObject.geometries_map;
        var updated_map = geometries_map;
        if (this.model.subsystem_name != '')
        {
            for (const geoName in geometries_map)
            {
            updated_map[geoName] = [this.model.subsystem_name, geometries_map[geoName]].join('.')
            };
        };
        
        this.model.geometries_map = updated_map;
        console.log(this.model.geometries_map)
    };

    makePickable()
    {
        for (var i=0; i<scene.meshes.length; i++) 
        {
            var mesh = scene.meshes[i];
            mesh.isPickable = true;
            mesh.actionManager = new BABYLON.ActionManager(scene);

            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger, function(bjsevt)
                    {
                        //console.log(bjsevt);
                        console.log(mesh.name)
                        camera.target = mesh
                        //focusTarget.parent = mesh;
                        //followCamera.lockedTarget = mesh;
                        //followCamera.parent = mesh;
                    }))
        };
    };

    construct_points()
    {
        const user_inputs = this.jsonObject.user_inputs;
        for (const inputName in user_inputs)
        {
            if (inputName.startsWith('hp'))
            {
                const [x, y, z] = user_inputs[inputName].args;
                this.model[inputName] = new BABYLON.Vector3(x, y, z);
                this.model[inputName] = this.model[inputName].scale(1/100);
                //console.log(inputName, this.model[inputName]);
            };
            
            if (inputName.startsWith('s_'))
            {
                this.model[inputName] = user_inputs[inputName] / 100;
                //console.log(inputName, this.model[inputName]);
            };
        };
        //console.log(this.model)
    };

    construct_geometries()
    {
        const statements = this.jsonObject.evaluations;
        for (const inputName in statements)
        {
            if (inputName.startsWith('gm') | inputName.startsWith('hp'))
            {
                const geo = statements[inputName];
                const constructorName  = geo.constructor;
                const constructorClass = Constructors[constructorName];
                const args = [];
                for (const i in geo.args)
                {
                    const arg = this.model[geo.args[i]];
                    //console.log(arg);
                    args.push(arg);
                };
                //console.log(geo.args)
                this.model[inputName] = constructorClass(inputName, args);
                //console.log(inputName, this.model[inputName]);
            };
        };
    };

    setGeometriesParent()
    {
        var geometries_map = this.jsonObject.geometries_map;
        for (const geoName in geometries_map)
        {
            this.model[geoName].mesh.parent = this.model.mesh
        };
    };

};
