'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var globals = require('../../utilities/globals');
var React = require('rehackt');
var context = require('../context');
var tslib = require('tslib');
var utilities = require('../../utilities');
var equal = require('@wry/equality');
var errors = require('../../errors');
var core = require('../../core');
var parser = require('../parser');
var internal = require('../internal');
var cache = require('../../cache');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        for (var k in e) {
            n[k] = e[k];
        }
    }
    n["default"] = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);
var equal__default = /*#__PURE__*/_interopDefaultLegacy(equal);

function useApolloClient(override) {
    var context$1 = React__namespace.useContext(context.getApolloContext());
    var client = override || context$1.client;
    globals.invariant(!!client, 49);
    return client;
}

var didWarnUncachedGetSnapshot = false;
var uSESKey = "useSyncExternalStore";
var realHook$1 = React__namespace[uSESKey];
var useSyncExternalStore = realHook$1 ||
    (function (subscribe, getSnapshot, getServerSnapshot) {
        var value = getSnapshot();
        if (
        globalThis.__DEV__ !== false &&
            !didWarnUncachedGetSnapshot &&
            value !== getSnapshot()) {
            didWarnUncachedGetSnapshot = true;
            globalThis.__DEV__ !== false && globals.invariant.error(58);
        }
        var _a = React__namespace.useState({
            inst: { value: value, getSnapshot: getSnapshot },
        }), inst = _a[0].inst, forceUpdate = _a[1];
        if (utilities.canUseLayoutEffect) {
            React__namespace.useLayoutEffect(function () {
                Object.assign(inst, { value: value, getSnapshot: getSnapshot });
                if (checkIfSnapshotChanged(inst)) {
                    forceUpdate({ inst: inst });
                }
            }, [subscribe, value, getSnapshot]);
        }
        else {
            Object.assign(inst, { value: value, getSnapshot: getSnapshot });
        }
        React__namespace.useEffect(function () {
            if (checkIfSnapshotChanged(inst)) {
                forceUpdate({ inst: inst });
            }
            return subscribe(function handleStoreChange() {
                if (checkIfSnapshotChanged(inst)) {
                    forceUpdate({ inst: inst });
                }
            });
        }, [subscribe]);
        return value;
    });
function checkIfSnapshotChanged(_a) {
    var value = _a.value, getSnapshot = _a.getSnapshot;
    try {
        return value !== getSnapshot();
    }
    catch (_b) {
        return true;
    }
}

function useDeepMemo(memoFn, deps) {
    var ref = React__namespace.useRef();
    if (!ref.current || !equal.equal(ref.current.deps, deps)) {
        ref.current = { value: memoFn(), deps: deps };
    }
    return ref.current.value;
}

function getRenderDispatcher() {
    var _a, _b;
    return (_b = (_a = React__namespace.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || _a === void 0 ? void 0 : _a.ReactCurrentDispatcher) === null || _b === void 0 ? void 0 : _b.current;
}
var RenderDispatcher = null;
function useRenderGuard() {
    RenderDispatcher = getRenderDispatcher();
    return React__namespace.useCallback(function () {
        return (RenderDispatcher != null && RenderDispatcher === getRenderDispatcher());
    }, []);
}

var INIT = {};
function useLazyRef(getInitialValue) {
    var ref = React__namespace.useRef(INIT);
    if (ref.current === INIT) {
        ref.current = getInitialValue();
    }
    return ref;
}

var useKey = "use";
var realHook = React__namespace[useKey];
var __use = realHook ||
    function __use(promise) {
        var statefulPromise = utilities.wrapPromiseWithState(promise);
        switch (statefulPromise.status) {
            case "pending":
                throw statefulPromise;
            case "rejected":
                throw statefulPromise.reason;
            case "fulfilled":
                return statefulPromise.value;
        }
    };

var wrapperSymbol = Symbol.for("apollo.hook.wrappers");
function wrapHook(hookName, useHook, clientOrObsQuery) {
    var queryManager = clientOrObsQuery["queryManager"];
    var wrappers = queryManager && queryManager[wrapperSymbol];
    var wrapper = wrappers && wrappers[hookName];
    return wrapper ? wrapper(useHook) : useHook;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function useQuery(query, options) {
    if (options === void 0) { options = Object.create(null); }
    return wrapHook("useQuery", _useQuery, useApolloClient(options && options.client))(query, options);
}
function _useQuery(query, options) {
    return useInternalState(useApolloClient(options.client), query).useQuery(options);
}
function useInternalState(client, query) {
    var forceUpdateState = React__namespace.useReducer(function (tick) { return tick + 1; }, 0)[1];
    function createInternalState(previous) {
        return Object.assign(new InternalState(client, query, previous), {
            forceUpdateState: forceUpdateState,
        });
    }
    var _a = React__namespace.useState(createInternalState), state = _a[0], updateState = _a[1];
    if (client !== state.client || query !== state.query) {
        updateState((state = createInternalState(state)));
    }
    return state;
}
var InternalState =  (function () {
    function InternalState(client, query, previous) {
        var _this = this;
        this.client = client;
        this.query = query;
        this.forceUpdate = function () { return _this.forceUpdateState(); };
        this.ssrDisabledResult = utilities.maybeDeepFreeze({
            loading: true,
            data: void 0,
            error: void 0,
            networkStatus: core.NetworkStatus.loading,
        });
        this.skipStandbyResult = utilities.maybeDeepFreeze({
            loading: false,
            data: void 0,
            error: void 0,
            networkStatus: core.NetworkStatus.ready,
        });
        this.toQueryResultCache = new (utilities.canUseWeakMap ? WeakMap : Map)();
        parser.verifyDocumentType(query, parser.DocumentType.Query);
        var previousResult = previous && previous.result;
        var previousData = previousResult && previousResult.data;
        if (previousData) {
            this.previousData = previousData;
        }
    }
    InternalState.prototype.forceUpdateState = function () {
        globalThis.__DEV__ !== false && globals.invariant.warn(51);
    };
    InternalState.prototype.executeQuery = function (options) {
        var _this = this;
        var _a;
        if (options.query) {
            Object.assign(this, { query: options.query });
        }
        this.watchQueryOptions = this.createWatchQueryOptions((this.queryHookOptions = options));
        var concast = this.observable.reobserveAsConcast(this.getObsQueryOptions());
        this.previousData = ((_a = this.result) === null || _a === void 0 ? void 0 : _a.data) || this.previousData;
        this.result = void 0;
        this.forceUpdate();
        return new Promise(function (resolve) {
            var result;
            concast.subscribe({
                next: function (value) {
                    result = value;
                },
                error: function () {
                    resolve(_this.toQueryResult(_this.observable.getCurrentResult()));
                },
                complete: function () {
                    resolve(_this.toQueryResult(result));
                },
            });
        });
    };
    InternalState.prototype.useQuery = function (options) {
        var _this = this;
        this.renderPromises = React__namespace.useContext(context.getApolloContext()).renderPromises;
        this.useOptions(options);
        var obsQuery = this.useObservableQuery();
        var result = useSyncExternalStore(React__namespace.useCallback(function (handleStoreChange) {
            if (_this.renderPromises) {
                return function () { };
            }
            _this.forceUpdate = handleStoreChange;
            var onNext = function () {
                var previousResult = _this.result;
                var result = obsQuery.getCurrentResult();
                if (previousResult &&
                    previousResult.loading === result.loading &&
                    previousResult.networkStatus === result.networkStatus &&
                    equal.equal(previousResult.data, result.data)) {
                    return;
                }
                _this.setResult(result);
            };
            var onError = function (error) {
                subscription.unsubscribe();
                subscription = obsQuery.resubscribeAfterError(onNext, onError);
                if (!hasOwnProperty.call(error, "graphQLErrors")) {
                    throw error;
                }
                var previousResult = _this.result;
                if (!previousResult ||
                    (previousResult && previousResult.loading) ||
                    !equal.equal(error, previousResult.error)) {
                    _this.setResult({
                        data: (previousResult && previousResult.data),
                        error: error,
                        loading: false,
                        networkStatus: core.NetworkStatus.error,
                    });
                }
            };
            var subscription = obsQuery.subscribe(onNext, onError);
            return function () {
                setTimeout(function () { return subscription.unsubscribe(); });
                _this.forceUpdate = function () { return _this.forceUpdateState(); };
            };
        }, [
            obsQuery,
            this.renderPromises,
            this.client.disableNetworkFetches,
        ]), function () { return _this.getCurrentResult(); }, function () { return _this.getCurrentResult(); });
        this.unsafeHandlePartialRefetch(result);
        return this.toQueryResult(result);
    };
    InternalState.prototype.useOptions = function (options) {
        var _a;
        var watchQueryOptions = this.createWatchQueryOptions((this.queryHookOptions = options));
        var currentWatchQueryOptions = this.watchQueryOptions;
        if (!equal.equal(watchQueryOptions, currentWatchQueryOptions)) {
            this.watchQueryOptions = watchQueryOptions;
            if (currentWatchQueryOptions && this.observable) {
                this.observable.reobserve(this.getObsQueryOptions());
                this.previousData = ((_a = this.result) === null || _a === void 0 ? void 0 : _a.data) || this.previousData;
                this.result = void 0;
            }
        }
        this.onCompleted =
            options.onCompleted || InternalState.prototype.onCompleted;
        this.onError = options.onError || InternalState.prototype.onError;
        if ((this.renderPromises || this.client.disableNetworkFetches) &&
            this.queryHookOptions.ssr === false &&
            !this.queryHookOptions.skip) {
            this.result = this.ssrDisabledResult;
        }
        else if (this.queryHookOptions.skip ||
            this.watchQueryOptions.fetchPolicy === "standby") {
            this.result = this.skipStandbyResult;
        }
        else if (this.result === this.ssrDisabledResult ||
            this.result === this.skipStandbyResult) {
            this.result = void 0;
        }
    };
    InternalState.prototype.getObsQueryOptions = function () {
        var toMerge = [];
        var globalDefaults = this.client.defaultOptions.watchQuery;
        if (globalDefaults)
            toMerge.push(globalDefaults);
        if (this.queryHookOptions.defaultOptions) {
            toMerge.push(this.queryHookOptions.defaultOptions);
        }
        toMerge.push(utilities.compact(this.observable && this.observable.options, this.watchQueryOptions));
        return toMerge.reduce(utilities.mergeOptions);
    };
    InternalState.prototype.createWatchQueryOptions = function (_a) {
        var _b;
        if (_a === void 0) { _a = {}; }
        var skip = _a.skip; _a.ssr; _a.onCompleted; _a.onError; _a.defaultOptions;
        var otherOptions = tslib.__rest(_a, ["skip", "ssr", "onCompleted", "onError", "defaultOptions"]);
        var watchQueryOptions = Object.assign(otherOptions, { query: this.query });
        if (this.renderPromises &&
            (watchQueryOptions.fetchPolicy === "network-only" ||
                watchQueryOptions.fetchPolicy === "cache-and-network")) {
            watchQueryOptions.fetchPolicy = "cache-first";
        }
        if (!watchQueryOptions.variables) {
            watchQueryOptions.variables = {};
        }
        if (skip) {
            var _c = watchQueryOptions.fetchPolicy, fetchPolicy = _c === void 0 ? this.getDefaultFetchPolicy() : _c, _d = watchQueryOptions.initialFetchPolicy, initialFetchPolicy = _d === void 0 ? fetchPolicy : _d;
            Object.assign(watchQueryOptions, {
                initialFetchPolicy: initialFetchPolicy,
                fetchPolicy: "standby",
            });
        }
        else if (!watchQueryOptions.fetchPolicy) {
            watchQueryOptions.fetchPolicy =
                ((_b = this.observable) === null || _b === void 0 ? void 0 : _b.options.initialFetchPolicy) ||
                    this.getDefaultFetchPolicy();
        }
        return watchQueryOptions;
    };
    InternalState.prototype.getDefaultFetchPolicy = function () {
        var _a, _b;
        return (((_a = this.queryHookOptions.defaultOptions) === null || _a === void 0 ? void 0 : _a.fetchPolicy) ||
            ((_b = this.client.defaultOptions.watchQuery) === null || _b === void 0 ? void 0 : _b.fetchPolicy) ||
            "cache-first");
    };
    InternalState.prototype.onCompleted = function (data) { };
    InternalState.prototype.onError = function (error) { };
    InternalState.prototype.useObservableQuery = function () {
        var obsQuery = (this.observable =
            (this.renderPromises &&
                this.renderPromises.getSSRObservable(this.watchQueryOptions)) ||
                this.observable ||
                this.client.watchQuery(this.getObsQueryOptions()));
        this.obsQueryFields = React__namespace.useMemo(function () { return ({
            refetch: obsQuery.refetch.bind(obsQuery),
            reobserve: obsQuery.reobserve.bind(obsQuery),
            fetchMore: obsQuery.fetchMore.bind(obsQuery),
            updateQuery: obsQuery.updateQuery.bind(obsQuery),
            startPolling: obsQuery.startPolling.bind(obsQuery),
            stopPolling: obsQuery.stopPolling.bind(obsQuery),
            subscribeToMore: obsQuery.subscribeToMore.bind(obsQuery),
        }); }, [obsQuery]);
        var ssrAllowed = !(this.queryHookOptions.ssr === false || this.queryHookOptions.skip);
        if (this.renderPromises && ssrAllowed) {
            this.renderPromises.registerSSRObservable(obsQuery);
            if (obsQuery.getCurrentResult().loading) {
                this.renderPromises.addObservableQueryPromise(obsQuery);
            }
        }
        return obsQuery;
    };
    InternalState.prototype.setResult = function (nextResult) {
        var previousResult = this.result;
        if (previousResult && previousResult.data) {
            this.previousData = previousResult.data;
        }
        this.result = nextResult;
        this.forceUpdate();
        this.handleErrorOrCompleted(nextResult, previousResult);
    };
    InternalState.prototype.handleErrorOrCompleted = function (result, previousResult) {
        var _this = this;
        if (!result.loading) {
            var error_1 = this.toApolloError(result);
            Promise.resolve()
                .then(function () {
                if (error_1) {
                    _this.onError(error_1);
                }
                else if (result.data &&
                    result.networkStatus === core.NetworkStatus.ready) {
                    _this.onCompleted(result.data);
                }
            })
                .catch(function (error) {
                globalThis.__DEV__ !== false && globals.invariant.warn(error);
            });
        }
    };
    InternalState.prototype.toApolloError = function (result) {
        return utilities.isNonEmptyArray(result.errors) ?
            new errors.ApolloError({ graphQLErrors: result.errors })
            : result.error;
    };
    InternalState.prototype.getCurrentResult = function () {
        if (!this.result) {
            this.handleErrorOrCompleted((this.result = this.observable.getCurrentResult()));
        }
        return this.result;
    };
    InternalState.prototype.toQueryResult = function (result) {
        var queryResult = this.toQueryResultCache.get(result);
        if (queryResult)
            return queryResult;
        var data = result.data; result.partial; var resultWithoutPartial = tslib.__rest(result, ["data", "partial"]);
        this.toQueryResultCache.set(result, (queryResult = tslib.__assign(tslib.__assign(tslib.__assign({ data: data }, resultWithoutPartial), this.obsQueryFields), { client: this.client, observable: this.observable, variables: this.observable.variables, called: !this.queryHookOptions.skip, previousData: this.previousData })));
        if (!queryResult.error && utilities.isNonEmptyArray(result.errors)) {
            queryResult.error = new errors.ApolloError({ graphQLErrors: result.errors });
        }
        return queryResult;
    };
    InternalState.prototype.unsafeHandlePartialRefetch = function (result) {
        if (result.partial &&
            this.queryHookOptions.partialRefetch &&
            !result.loading &&
            (!result.data || Object.keys(result.data).length === 0) &&
            this.observable.options.fetchPolicy !== "cache-only") {
            Object.assign(result, {
                loading: true,
                networkStatus: core.NetworkStatus.refetch,
            });
            this.observable.refetch();
        }
    };
    return InternalState;
}());

var EAGER_METHODS = [
    "refetch",
    "reobserve",
    "fetchMore",
    "updateQuery",
    "startPolling",
    "subscribeToMore",
];
function useLazyQuery(query, options) {
    var _a;
    var execOptionsRef = React__namespace.useRef();
    var optionsRef = React__namespace.useRef();
    var queryRef = React__namespace.useRef();
    var merged = utilities.mergeOptions(options, execOptionsRef.current || {});
    var document = (_a = merged === null || merged === void 0 ? void 0 : merged.query) !== null && _a !== void 0 ? _a : query;
    optionsRef.current = options;
    queryRef.current = document;
    var internalState = useInternalState(useApolloClient(options && options.client), document);
    var useQueryResult = internalState.useQuery(tslib.__assign(tslib.__assign({}, merged), { skip: !execOptionsRef.current }));
    var initialFetchPolicy = useQueryResult.observable.options.initialFetchPolicy ||
        internalState.getDefaultFetchPolicy();
    var forceUpdateState = internalState.forceUpdateState, obsQueryFields = internalState.obsQueryFields;
    var eagerMethods = React__namespace.useMemo(function () {
        var eagerMethods = {};
        var _loop_1 = function (key) {
            var method = obsQueryFields[key];
            eagerMethods[key] = function () {
                if (!execOptionsRef.current) {
                    execOptionsRef.current = Object.create(null);
                    forceUpdateState();
                }
                return method.apply(this, arguments);
            };
        };
        for (var _i = 0, EAGER_METHODS_1 = EAGER_METHODS; _i < EAGER_METHODS_1.length; _i++) {
            var key = EAGER_METHODS_1[_i];
            _loop_1(key);
        }
        return eagerMethods;
    }, [forceUpdateState, obsQueryFields]);
    var called = !!execOptionsRef.current;
    var result = React__namespace.useMemo(function () { return (tslib.__assign(tslib.__assign(tslib.__assign({}, useQueryResult), eagerMethods), { called: called })); }, [useQueryResult, eagerMethods, called]);
    var execute = React__namespace.useCallback(function (executeOptions) {
        execOptionsRef.current =
            executeOptions ? tslib.__assign(tslib.__assign({}, executeOptions), { fetchPolicy: executeOptions.fetchPolicy || initialFetchPolicy }) : {
                fetchPolicy: initialFetchPolicy,
            };
        var options = utilities.mergeOptions(optionsRef.current, tslib.__assign({ query: queryRef.current }, execOptionsRef.current));
        var promise = internalState
            .executeQuery(tslib.__assign(tslib.__assign({}, options), { skip: false }))
            .then(function (queryResult) { return Object.assign(queryResult, eagerMethods); });
        promise.catch(function () { });
        return promise;
    }, [eagerMethods, initialFetchPolicy, internalState]);
    return [execute, result];
}

function useMutation(mutation, options) {
    var client = useApolloClient(options === null || options === void 0 ? void 0 : options.client);
    parser.verifyDocumentType(mutation, parser.DocumentType.Mutation);
    var _a = React__namespace.useState({
        called: false,
        loading: false,
        client: client,
    }), result = _a[0], setResult = _a[1];
    var ref = React__namespace.useRef({
        result: result,
        mutationId: 0,
        isMounted: true,
        client: client,
        mutation: mutation,
        options: options,
    });
    React__namespace.useLayoutEffect(function () {
        Object.assign(ref.current, { client: client, options: options, mutation: mutation });
    });
    var execute = React__namespace.useCallback(function (executeOptions) {
        if (executeOptions === void 0) { executeOptions = {}; }
        var _a = ref.current, options = _a.options, mutation = _a.mutation;
        var baseOptions = tslib.__assign(tslib.__assign({}, options), { mutation: mutation });
        var client = executeOptions.client || ref.current.client;
        if (!ref.current.result.loading &&
            !baseOptions.ignoreResults &&
            ref.current.isMounted) {
            setResult((ref.current.result = {
                loading: true,
                error: void 0,
                data: void 0,
                called: true,
                client: client,
            }));
        }
        var mutationId = ++ref.current.mutationId;
        var clientOptions = utilities.mergeOptions(baseOptions, executeOptions);
        return client
            .mutate(clientOptions)
            .then(function (response) {
            var _a, _b;
            var data = response.data, errors$1 = response.errors;
            var error = errors$1 && errors$1.length > 0 ?
                new errors.ApolloError({ graphQLErrors: errors$1 })
                : void 0;
            var onError = executeOptions.onError || ((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onError);
            if (error && onError) {
                onError(error, clientOptions);
            }
            if (mutationId === ref.current.mutationId &&
                !clientOptions.ignoreResults) {
                var result_1 = {
                    called: true,
                    loading: false,
                    data: data,
                    error: error,
                    client: client,
                };
                if (ref.current.isMounted && !equal.equal(ref.current.result, result_1)) {
                    setResult((ref.current.result = result_1));
                }
            }
            var onCompleted = executeOptions.onCompleted || ((_b = ref.current.options) === null || _b === void 0 ? void 0 : _b.onCompleted);
            if (!error) {
                onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response.data, clientOptions);
            }
            return response;
        })
            .catch(function (error) {
            var _a;
            if (mutationId === ref.current.mutationId && ref.current.isMounted) {
                var result_2 = {
                    loading: false,
                    error: error,
                    data: void 0,
                    called: true,
                    client: client,
                };
                if (!equal.equal(ref.current.result, result_2)) {
                    setResult((ref.current.result = result_2));
                }
            }
            var onError = executeOptions.onError || ((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onError);
            if (onError) {
                onError(error, clientOptions);
                return { data: void 0, errors: error };
            }
            throw error;
        });
    }, []);
    var reset = React__namespace.useCallback(function () {
        if (ref.current.isMounted) {
            var result_3 = {
                called: false,
                loading: false,
                client: ref.current.client,
            };
            Object.assign(ref.current, { mutationId: 0, result: result_3 });
            setResult(result_3);
        }
    }, []);
    React__namespace.useEffect(function () {
        var current = ref.current;
        current.isMounted = true;
        return function () {
            current.isMounted = false;
        };
    }, []);
    return [execute, tslib.__assign({ reset: reset }, result)];
}

function useSubscription(subscription, options) {
    var hasIssuedDeprecationWarningRef = React__namespace.useRef(false);
    var client = useApolloClient(options === null || options === void 0 ? void 0 : options.client);
    parser.verifyDocumentType(subscription, parser.DocumentType.Subscription);
    var _a = React__namespace.useState({
        loading: !(options === null || options === void 0 ? void 0 : options.skip),
        error: void 0,
        data: void 0,
        variables: options === null || options === void 0 ? void 0 : options.variables,
    }), result = _a[0], setResult = _a[1];
    if (!hasIssuedDeprecationWarningRef.current) {
        hasIssuedDeprecationWarningRef.current = true;
        if (options === null || options === void 0 ? void 0 : options.onSubscriptionData) {
            globalThis.__DEV__ !== false && globals.invariant.warn(options.onData ? 52 : 53);
        }
        if (options === null || options === void 0 ? void 0 : options.onSubscriptionComplete) {
            globalThis.__DEV__ !== false && globals.invariant.warn(options.onComplete ? 54 : 55);
        }
    }
    var _b = React__namespace.useState(function () {
        if (options === null || options === void 0 ? void 0 : options.skip) {
            return null;
        }
        return client.subscribe({
            query: subscription,
            variables: options === null || options === void 0 ? void 0 : options.variables,
            fetchPolicy: options === null || options === void 0 ? void 0 : options.fetchPolicy,
            context: options === null || options === void 0 ? void 0 : options.context,
        });
    }), observable = _b[0], setObservable = _b[1];
    var canResetObservableRef = React__namespace.useRef(false);
    React__namespace.useEffect(function () {
        return function () {
            canResetObservableRef.current = true;
        };
    }, []);
    var ref = React__namespace.useRef({ client: client, subscription: subscription, options: options });
    React__namespace.useEffect(function () {
        var _a, _b, _c, _d;
        var shouldResubscribe = options === null || options === void 0 ? void 0 : options.shouldResubscribe;
        if (typeof shouldResubscribe === "function") {
            shouldResubscribe = !!shouldResubscribe(options);
        }
        if (options === null || options === void 0 ? void 0 : options.skip) {
            if (!(options === null || options === void 0 ? void 0 : options.skip) !== !((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.skip) ||
                canResetObservableRef.current) {
                setResult({
                    loading: false,
                    data: void 0,
                    error: void 0,
                    variables: options === null || options === void 0 ? void 0 : options.variables,
                });
                setObservable(null);
                canResetObservableRef.current = false;
            }
        }
        else if ((shouldResubscribe !== false &&
            (client !== ref.current.client ||
                subscription !== ref.current.subscription ||
                (options === null || options === void 0 ? void 0 : options.fetchPolicy) !== ((_b = ref.current.options) === null || _b === void 0 ? void 0 : _b.fetchPolicy) ||
                !(options === null || options === void 0 ? void 0 : options.skip) !== !((_c = ref.current.options) === null || _c === void 0 ? void 0 : _c.skip) ||
                !equal.equal(options === null || options === void 0 ? void 0 : options.variables, (_d = ref.current.options) === null || _d === void 0 ? void 0 : _d.variables))) ||
            canResetObservableRef.current) {
            setResult({
                loading: true,
                data: void 0,
                error: void 0,
                variables: options === null || options === void 0 ? void 0 : options.variables,
            });
            setObservable(client.subscribe({
                query: subscription,
                variables: options === null || options === void 0 ? void 0 : options.variables,
                fetchPolicy: options === null || options === void 0 ? void 0 : options.fetchPolicy,
                context: options === null || options === void 0 ? void 0 : options.context,
            }));
            canResetObservableRef.current = false;
        }
        Object.assign(ref.current, { client: client, subscription: subscription, options: options });
    }, [client, subscription, options, canResetObservableRef.current]);
    React__namespace.useEffect(function () {
        if (!observable) {
            return;
        }
        var subscriptionStopped = false;
        var subscription = observable.subscribe({
            next: function (fetchResult) {
                var _a, _b;
                if (subscriptionStopped) {
                    return;
                }
                var result = {
                    loading: false,
                    data: fetchResult.data,
                    error: void 0,
                    variables: options === null || options === void 0 ? void 0 : options.variables,
                };
                setResult(result);
                if ((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onData) {
                    ref.current.options.onData({
                        client: client,
                        data: result,
                    });
                }
                else if ((_b = ref.current.options) === null || _b === void 0 ? void 0 : _b.onSubscriptionData) {
                    ref.current.options.onSubscriptionData({
                        client: client,
                        subscriptionData: result,
                    });
                }
            },
            error: function (error) {
                var _a, _b;
                if (!subscriptionStopped) {
                    setResult({
                        loading: false,
                        data: void 0,
                        error: error,
                        variables: options === null || options === void 0 ? void 0 : options.variables,
                    });
                    (_b = (_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
                }
            },
            complete: function () {
                var _a, _b;
                if (!subscriptionStopped) {
                    if ((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onComplete) {
                        ref.current.options.onComplete();
                    }
                    else if ((_b = ref.current.options) === null || _b === void 0 ? void 0 : _b.onSubscriptionComplete) {
                        ref.current.options.onSubscriptionComplete();
                    }
                }
            },
        });
        return function () {
            subscriptionStopped = true;
            setTimeout(function () {
                subscription.unsubscribe();
            });
        };
    }, [observable]);
    return result;
}

function useReactiveVar(rv) {
    return useSyncExternalStore(React__namespace.useCallback(function (update) {
        return rv.onNextChange(function onNext() {
            update();
            rv.onNextChange(onNext);
        });
    }, [rv]), rv, rv);
}

function useFragment(options) {
    return wrapHook("useFragment", _useFragment, useApolloClient(options.client))(options);
}
function _useFragment(options) {
    var cache = useApolloClient(options.client).cache;
    var diffOptions = useDeepMemo(function () {
        var fragment = options.fragment, fragmentName = options.fragmentName, from = options.from, _a = options.optimistic, optimistic = _a === void 0 ? true : _a, rest = tslib.__rest(options, ["fragment", "fragmentName", "from", "optimistic"]);
        return tslib.__assign(tslib.__assign({}, rest), { returnPartialData: true, id: typeof from === "string" ? from : cache.identify(from), query: cache["getFragmentDoc"](fragment, fragmentName), optimistic: optimistic });
    }, [options]);
    var resultRef = useLazyRef(function () {
        return diffToResult(cache.diff(diffOptions));
    });
    var stableOptions = useDeepMemo(function () { return options; }, [options]);
    React__namespace.useMemo(function () {
        resultRef.current = diffToResult(cache.diff(diffOptions));
    }, [diffOptions, cache]);
    var getSnapshot = React__namespace.useCallback(function () { return resultRef.current; }, []);
    return useSyncExternalStore(React__namespace.useCallback(function (forceUpdate) {
        var lastTimeout = 0;
        var subscription = cache.watchFragment(stableOptions).subscribe({
            next: function (result) {
                if (equal__default(result, resultRef.current))
                    return;
                resultRef.current = result;
                clearTimeout(lastTimeout);
                lastTimeout = setTimeout(forceUpdate);
            },
        });
        return function () {
            subscription.unsubscribe();
            clearTimeout(lastTimeout);
        };
    }, [cache, stableOptions]), getSnapshot, getSnapshot);
}
function diffToResult(diff) {
    var result = {
        data: diff.result,
        complete: !!diff.complete,
    };
    if (diff.missing) {
        result.missing = utilities.mergeDeepArray(diff.missing.map(function (error) { return error.missing; }));
    }
    return result;
}

var skipToken = Symbol.for("apollo.skipToken");

function useSuspenseQuery(query, options) {
    if (options === void 0) { options = Object.create(null); }
    return wrapHook("useSuspenseQuery", _useSuspenseQuery, useApolloClient(typeof options === "object" ? options.client : undefined))(query, options);
}
function _useSuspenseQuery(query, options) {
    var client = useApolloClient(options.client);
    var suspenseCache = internal.getSuspenseCache(client);
    var watchQueryOptions = useWatchQueryOptions({
        client: client,
        query: query,
        options: options,
    });
    var fetchPolicy = watchQueryOptions.fetchPolicy, variables = watchQueryOptions.variables;
    var _a = options.queryKey, queryKey = _a === void 0 ? [] : _a;
    var cacheKey = tslib.__spreadArray([
        query,
        cache.canonicalStringify(variables)
    ], [].concat(queryKey), true);
    var queryRef = suspenseCache.getQueryRef(cacheKey, function () {
        return client.watchQuery(watchQueryOptions);
    });
    var _b = React__namespace.useState([queryRef.key, queryRef.promise]), current = _b[0], setPromise = _b[1];
    if (current[0] !== queryRef.key) {
        current[0] = queryRef.key;
        current[1] = queryRef.promise;
    }
    var promise = current[1];
    if (queryRef.didChangeOptions(watchQueryOptions)) {
        current[1] = promise = queryRef.applyOptions(watchQueryOptions);
    }
    React__namespace.useEffect(function () {
        var dispose = queryRef.retain();
        var removeListener = queryRef.listen(function (promise) {
            setPromise([queryRef.key, promise]);
        });
        return function () {
            removeListener();
            dispose();
        };
    }, [queryRef]);
    var skipResult = React__namespace.useMemo(function () {
        var error = toApolloError(queryRef.result);
        return {
            loading: false,
            data: queryRef.result.data,
            networkStatus: error ? core.NetworkStatus.error : core.NetworkStatus.ready,
            error: error,
        };
    }, [queryRef.result]);
    var result = fetchPolicy === "standby" ? skipResult : __use(promise);
    var fetchMore = React__namespace.useCallback((function (options) {
        var promise = queryRef.fetchMore(options);
        setPromise([queryRef.key, queryRef.promise]);
        return promise;
    }), [queryRef]);
    var refetch = React__namespace.useCallback(function (variables) {
        var promise = queryRef.refetch(variables);
        setPromise([queryRef.key, queryRef.promise]);
        return promise;
    }, [queryRef]);
    var subscribeToMore = React__namespace.useCallback(function (options) { return queryRef.observable.subscribeToMore(options); }, [queryRef]);
    return React__namespace.useMemo(function () {
        return {
            client: client,
            data: result.data,
            error: toApolloError(result),
            networkStatus: result.networkStatus,
            fetchMore: fetchMore,
            refetch: refetch,
            subscribeToMore: subscribeToMore,
        };
    }, [client, fetchMore, refetch, result, subscribeToMore]);
}
function validateOptions(options) {
    var query = options.query, fetchPolicy = options.fetchPolicy, returnPartialData = options.returnPartialData;
    parser.verifyDocumentType(query, parser.DocumentType.Query);
    validateFetchPolicy(fetchPolicy);
    validatePartialDataReturn(fetchPolicy, returnPartialData);
}
function validateFetchPolicy(fetchPolicy) {
    if (fetchPolicy === void 0) { fetchPolicy = "cache-first"; }
    var supportedFetchPolicies = [
        "cache-first",
        "network-only",
        "no-cache",
        "cache-and-network",
    ];
    globals.invariant(supportedFetchPolicies.includes(fetchPolicy), 56, fetchPolicy);
}
function validatePartialDataReturn(fetchPolicy, returnPartialData) {
    if (fetchPolicy === "no-cache" && returnPartialData) {
        globalThis.__DEV__ !== false && globals.invariant.warn(57);
    }
}
function toApolloError(result) {
    return utilities.isNonEmptyArray(result.errors) ?
        new core.ApolloError({ graphQLErrors: result.errors })
        : result.error;
}
function useWatchQueryOptions(_a) {
    var client = _a.client, query = _a.query, options = _a.options;
    return useDeepMemo(function () {
        var _a;
        if (options === skipToken) {
            return { query: query, fetchPolicy: "standby" };
        }
        var fetchPolicy = options.fetchPolicy ||
            ((_a = client.defaultOptions.watchQuery) === null || _a === void 0 ? void 0 : _a.fetchPolicy) ||
            "cache-first";
        var watchQueryOptions = tslib.__assign(tslib.__assign({}, options), { fetchPolicy: fetchPolicy, query: query, notifyOnNetworkStatusChange: false, nextFetchPolicy: void 0 });
        if (globalThis.__DEV__ !== false) {
            validateOptions(watchQueryOptions);
        }
        if (options.skip) {
            watchQueryOptions.fetchPolicy = "standby";
        }
        return watchQueryOptions;
    }, [client, options, query]);
}

function useBackgroundQuery(query, options) {
    if (options === void 0) { options = Object.create(null); }
    return wrapHook("useBackgroundQuery", _useBackgroundQuery, useApolloClient(typeof options === "object" ? options.client : undefined))(query, options);
}
function _useBackgroundQuery(query, options) {
    var client = useApolloClient(options.client);
    var suspenseCache = internal.getSuspenseCache(client);
    var watchQueryOptions = useWatchQueryOptions({ client: client, query: query, options: options });
    var fetchPolicy = watchQueryOptions.fetchPolicy, variables = watchQueryOptions.variables;
    var _a = options.queryKey, queryKey = _a === void 0 ? [] : _a;
    var didFetchResult = React__namespace.useRef(fetchPolicy !== "standby");
    didFetchResult.current || (didFetchResult.current = fetchPolicy !== "standby");
    var cacheKey = tslib.__spreadArray([
        query,
        cache.canonicalStringify(variables)
    ], [].concat(queryKey), true);
    var queryRef = suspenseCache.getQueryRef(cacheKey, function () {
        return client.watchQuery(watchQueryOptions);
    });
    var _b = React__namespace.useState(internal.wrapQueryRef(queryRef)), wrappedQueryRef = _b[0], setWrappedQueryRef = _b[1];
    if (internal.unwrapQueryRef(wrappedQueryRef) !== queryRef) {
        setWrappedQueryRef(internal.wrapQueryRef(queryRef));
    }
    if (queryRef.didChangeOptions(watchQueryOptions)) {
        var promise = queryRef.applyOptions(watchQueryOptions);
        internal.updateWrappedQueryRef(wrappedQueryRef, promise);
    }
    React__namespace.useEffect(function () {
        var id = setTimeout(function () {
            if (queryRef.disposed) {
                suspenseCache.add(cacheKey, queryRef);
            }
        });
        return function () { return clearTimeout(id); };
    });
    var fetchMore = React__namespace.useCallback(function (options) {
        var promise = queryRef.fetchMore(options);
        setWrappedQueryRef(internal.wrapQueryRef(queryRef));
        return promise;
    }, [queryRef]);
    var refetch = React__namespace.useCallback(function (variables) {
        var promise = queryRef.refetch(variables);
        setWrappedQueryRef(internal.wrapQueryRef(queryRef));
        return promise;
    }, [queryRef]);
    React__namespace.useEffect(function () { return queryRef.softRetain(); }, [queryRef]);
    return [
        didFetchResult.current ? wrappedQueryRef : void 0,
        { fetchMore: fetchMore, refetch: refetch },
    ];
}

function useLoadableQuery(query, options) {
    if (options === void 0) { options = Object.create(null); }
    var client = useApolloClient(options.client);
    var suspenseCache = internal.getSuspenseCache(client);
    var watchQueryOptions = useWatchQueryOptions({ client: client, query: query, options: options });
    var _a = options.queryKey, queryKey = _a === void 0 ? [] : _a;
    var _b = React__namespace.useState(null), queryRef = _b[0], setQueryRef = _b[1];
    internal.assertWrappedQueryRef(queryRef);
    var internalQueryRef = queryRef && internal.unwrapQueryRef(queryRef);
    if (queryRef && (internalQueryRef === null || internalQueryRef === void 0 ? void 0 : internalQueryRef.didChangeOptions(watchQueryOptions))) {
        var promise = internalQueryRef.applyOptions(watchQueryOptions);
        internal.updateWrappedQueryRef(queryRef, promise);
    }
    var calledDuringRender = useRenderGuard();
    var fetchMore = React__namespace.useCallback(function (options) {
        if (!internalQueryRef) {
            throw new Error("The query has not been loaded. Please load the query.");
        }
        var promise = internalQueryRef.fetchMore(options);
        setQueryRef(internal.wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    var refetch = React__namespace.useCallback(function (options) {
        if (!internalQueryRef) {
            throw new Error("The query has not been loaded. Please load the query.");
        }
        var promise = internalQueryRef.refetch(options);
        setQueryRef(internal.wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    var loadQuery = React__namespace.useCallback(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        globals.invariant(!calledDuringRender(), 50);
        var variables = args[0];
        var cacheKey = tslib.__spreadArray([
            query,
            cache.canonicalStringify(variables)
        ], [].concat(queryKey), true);
        var queryRef = suspenseCache.getQueryRef(cacheKey, function () {
            return client.watchQuery(tslib.__assign(tslib.__assign({}, watchQueryOptions), { variables: variables }));
        });
        setQueryRef(internal.wrapQueryRef(queryRef));
    }, [query, queryKey, suspenseCache, watchQueryOptions, calledDuringRender]);
    var reset = React__namespace.useCallback(function () {
        setQueryRef(null);
    }, [queryRef]);
    return [loadQuery, queryRef, { fetchMore: fetchMore, refetch: refetch, reset: reset }];
}

function useQueryRefHandlers(queryRef) {
    var unwrapped = internal.unwrapQueryRef(queryRef);
    return wrapHook("useQueryRefHandlers", _useQueryRefHandlers, unwrapped ?
        unwrapped["observable"]
        : useApolloClient())(queryRef);
}
function _useQueryRefHandlers(queryRef) {
    internal.assertWrappedQueryRef(queryRef);
    var _a = React__namespace.useState(queryRef), previousQueryRef = _a[0], setPreviousQueryRef = _a[1];
    var _b = React__namespace.useState(queryRef), wrappedQueryRef = _b[0], setWrappedQueryRef = _b[1];
    var internalQueryRef = internal.unwrapQueryRef(queryRef);
    if (previousQueryRef !== queryRef) {
        setPreviousQueryRef(queryRef);
        setWrappedQueryRef(queryRef);
    }
    else {
        internal.updateWrappedQueryRef(queryRef, internal.getWrappedPromise(wrappedQueryRef));
    }
    var refetch = React__namespace.useCallback(function (variables) {
        var promise = internalQueryRef.refetch(variables);
        setWrappedQueryRef(internal.wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    var fetchMore = React__namespace.useCallback(function (options) {
        var promise = internalQueryRef.fetchMore(options);
        setWrappedQueryRef(internal.wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    return { refetch: refetch, fetchMore: fetchMore };
}

function useReadQuery(queryRef) {
    var unwrapped = internal.unwrapQueryRef(queryRef);
    return wrapHook("useReadQuery", _useReadQuery, unwrapped ?
        unwrapped["observable"]
        : useApolloClient())(queryRef);
}
function _useReadQuery(queryRef) {
    internal.assertWrappedQueryRef(queryRef);
    var internalQueryRef = React__namespace.useMemo(function () { return internal.unwrapQueryRef(queryRef); }, [queryRef]);
    var getPromise = React__namespace.useCallback(function () { return internal.getWrappedPromise(queryRef); }, [queryRef]);
    if (internalQueryRef.disposed) {
        internalQueryRef.reinitialize();
        internal.updateWrappedQueryRef(queryRef, internalQueryRef.promise);
    }
    React__namespace.useEffect(function () { return internalQueryRef.retain(); }, [internalQueryRef]);
    var promise = useSyncExternalStore(React__namespace.useCallback(function (forceUpdate) {
        return internalQueryRef.listen(function (promise) {
            internal.updateWrappedQueryRef(queryRef, promise);
            forceUpdate();
        });
    }, [internalQueryRef]), getPromise, getPromise);
    var result = __use(promise);
    return React__namespace.useMemo(function () {
        return {
            data: result.data,
            networkStatus: result.networkStatus,
            error: toApolloError(result),
        };
    }, [result]);
}

exports.skipToken = skipToken;
exports.useApolloClient = useApolloClient;
exports.useBackgroundQuery = useBackgroundQuery;
exports.useFragment = useFragment;
exports.useLazyQuery = useLazyQuery;
exports.useLoadableQuery = useLoadableQuery;
exports.useMutation = useMutation;
exports.useQuery = useQuery;
exports.useQueryRefHandlers = useQueryRefHandlers;
exports.useReactiveVar = useReactiveVar;
exports.useReadQuery = useReadQuery;
exports.useSubscription = useSubscription;
exports.useSuspenseQuery = useSuspenseQuery;
//# sourceMappingURL=hooks.cjs.map
